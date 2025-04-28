import React, { useEffect, useRef, useState, memo } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import * as d3 from 'd3';

// Component to display the SVG map and draw the navigation path for a single segment
const Map = ({ map: mapPath, pathCoordinates, scale = 1, onLoad }) => {
  const svgContainerRef = useRef(null);
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const [svgContent, setSvgContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 }); // Store SVG original dimensions

  // Load SVG Content
  useEffect(() => {
    setSvgContent(null);
    setError(null);
    setIsLoading(false);
    setSvgDimensions({ width: 0, height: 0 }); // Reset dimensions
    svgRef.current = null;
    zoomRef.current = null;

    if (!mapPath) {
      console.warn("[Map.jsx] No map file specified.");
      return;
    }

    setIsLoading(true);
    console.log("[Map.jsx] Fetching SVG from:", mapPath);
    let isMounted = true;

    fetch(mapPath)
      .then(response => {
        if (!response.ok) throw new Error(`Failed to load SVG map: ${response.status} ${response.statusText} from ${mapPath}`);
        return response.text();
      })
      .then(text => {
        if (isMounted) {
          if (text && text.trim().includes('<svg')) {
            setSvgContent(text);
            setError(null);
            if (onLoad) onLoad();  // <- fire only when SVG is valid
          } else {
            setError("Invalid or non-SVG file content received.");
            setSvgContent(null);
          }
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error("[Map.jsx] Error fetching or processing SVG:", err);
          setError(`Could not load map (${mapPath}): ${err.message}`);
          setSvgContent(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, [mapPath]); // Re-run only if mapPath changes

  // Setup SVG, D3 Zoom, and Draw Path
  useEffect(() => {
    if (!svgContent || !svgContainerRef.current) return;

    const container = svgContainerRef.current;
    // Inject SVG content
    container.innerHTML = svgContent;
    const svgElement = container.querySelector('svg');

    if (!svgElement) {
      console.error("[Map.jsx] SVG element not found after injection.");
      setError("Failed to find SVG element in loaded content.");
      return;
    }
    svgRef.current = d3.select(svgElement); // Store D3 selection of SVG

    // Get SVG Dimensions from viewBox or attributes
    let svgWidth = 0;
    let svgHeight = 0;
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
        const parts = viewBox.split(/[,\s]+/);
        if (parts.length === 4) {
            svgWidth = parseFloat(parts[2]);
            svgHeight = parseFloat(parts[3]);
        }
    }
    // Fallback to width/height attributes if viewBox is missing or invalid
    if (!svgWidth || !svgHeight) {
        svgWidth = parseFloat(svgElement.getAttribute('width')) || 600; // Default width
        svgHeight = parseFloat(svgElement.getAttribute('height')) || 400; // Default height
        // Ensure viewBox is set for zoom calculations if it was missing
        if (!viewBox) {
            svgElement.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
        }
    }
     if (svgWidth > 0 && svgHeight > 0) {
        setSvgDimensions({ width: svgWidth, height: svgHeight });
        console.log(`[Map.jsx] SVG Dimensions set: ${svgWidth} x ${svgHeight}`);
    } else {
        console.error("[Map.jsx] Could not determine valid SVG dimensions.");
        setError("Could not determine SVG dimensions.");
        return;
    }

    // Setup D3 Zoom
    // Create a group element inside SVG to apply zoom transform
    const g = svgRef.current.select("g.zoom-group");
    if (g.empty()) {
        // If group doesn't exist, create it and move all SVG children into it
        const zoomGroup = svgRef.current.append("g").attr("class", "zoom-group");
        svgRef.current.selectAll(":scope > *:not(g.zoom-group)").each(function() {
            zoomGroup.node().appendChild(this);
        });
    } else {
         // If group exists, ensure it's selected
         // This might be needed if SVG structure changes
    }

    const zoomGroupSelection = svgRef.current.select("g.zoom-group");

    // Define zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.3, 5]) // Min/max zoom scale
        .on("zoom", (event) => {
            zoomGroupSelection.attr("transform", event.transform); // Apply transform to the group
        });
    zoomRef.current = zoom; // Store zoom instance

    // Apply zoom behavior to the SVG element itself
    svgRef.current.call(zoom);

    // Draw Path
    const pathId = 'navigation-path-segment';
    const startMarkerId = 'nav-start-marker';
    const endMarkerId = 'nav-end-marker';

    // Always remove old path elements from the zoom group
    zoomGroupSelection.select(`#${pathId}`).remove();
    zoomGroupSelection.select(`#${startMarkerId}`).remove();
    zoomGroupSelection.select(`#${endMarkerId}`).remove();

    // Validate coordinates
    if (pathCoordinates && Array.isArray(pathCoordinates) && pathCoordinates.length > 0) {
      const validCoords = pathCoordinates.filter(
          p => Array.isArray(p) && p.length === 2 && !isNaN(parseFloat(p[0])) && !isNaN(parseFloat(p[1]))
      ).map(p => [parseFloat(p[0]), parseFloat(p[1])]);

      if (validCoords.length > 0) {
        // Draw path line if more than one point
        if (validCoords.length > 1) {
          const pointsString = validCoords.map(coord => `${coord[0]},${coord[1]}`).join(' ');
          zoomGroupSelection.append('polyline') // Append to the zoom group
              .attr('id', pathId)
              .attr('points', pointsString)
              .attr('fill', 'none')
              .attr('stroke', 'purple')
              .attr('stroke-width', 5 / (zoomRef.current?.transform?.k || 1)) // Adjust stroke width based on zoom
              .attr('stroke-opacity', 0.8)
              .attr('stroke-linecap', 'round')
              .attr('stroke-linejoin', 'round')
              .attr('vector-effect', 'non-scaling-stroke'); // Keep stroke width consistent visually
        }

        // Draw Start Marker
        zoomGroupSelection.append('circle')
           .attr('id', startMarkerId)
           .attr('cx', validCoords[0][0])
           .attr('cy', validCoords[0][1])
           .attr('r', 8 / (zoomRef.current?.transform?.k || 1)) // Scale marker size with zoom
           .attr('fill', 'lime')
           .attr('stroke', 'black')
           .attr('stroke-width', 1.5 / (zoomRef.current?.transform?.k || 1)) // Scale stroke width
           .attr('vector-effect', 'non-scaling-stroke');

        // Draw End Marker
        if (validCoords.length > 1) {
          zoomGroupSelection.append('circle')
             .attr('id', endMarkerId)
             .attr('cx', validCoords[validCoords.length - 1][0])
             .attr('cy', validCoords[validCoords.length - 1][1])
             .attr('r', 8 / (zoomRef.current?.transform?.k || 1))
             .attr('fill', 'red')
             .attr('stroke', 'black')
             .attr('stroke-width', 1.5 / (zoomRef.current?.transform?.k || 1))
             .attr('vector-effect', 'non-scaling-stroke');
        }

        // Auto Zoom Logic --- BUT NOT WORKING!!!?
        if (svgRef.current && zoomRef.current && svgDimensions.width > 0 && svgDimensions.height > 0) {
            const svgNode = svgRef.current.node();
            const containerWidth = svgNode.clientWidth || container.clientWidth; // Use actual rendered width
            const containerHeight = svgNode.clientHeight || container.clientHeight; // Use actual rendered height

             if (containerWidth > 0 && containerHeight > 0) {
                // Calculate bounding box of the path
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                validCoords.forEach(([x, y]) => {
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                });

                const pathWidth = (maxX - minX) || 50; // Use minimum width/height if single point
                const pathHeight = (maxY - minY) || 50;
                const pathCenterX = minX + pathWidth / 2;
                const pathCenterY = minY + pathHeight / 2;

                // Calculate desired scale
                const padding = 0.2; // 20% padding
                const scaleX = containerWidth / (pathWidth * (1 + padding));
                const scaleY = containerHeight / (pathHeight * (1 + padding));
                let scale = Math.min(scaleX, scaleY, zoomRef.current.scaleExtent()[1]); // Use min scale, limit by max zoom
                scale = Math.max(scale, zoomRef.current.scaleExtent()[0]); // Ensure scale is not below min zoom

                // Calculate translation to center the path
                const translateX = containerWidth / 2 - pathCenterX * scale;
                const translateY = containerHeight / 2 - pathCenterY * scale;

                // Create the target zoom transform
                const targetTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

                // Apply the transform smoothly
                svgRef.current.transition()
                    .duration(750) // Animation duration in ms
                    .call(zoomRef.current.transform, targetTransform);

                 console.log(`[Map.jsx] Auto-zooming. Path Center: (${pathCenterX.toFixed(1)}, ${pathCenterY.toFixed(1)}), Scale: ${scale.toFixed(2)}, Translate: (${translateX.toFixed(1)}, ${translateY.toFixed(1)})`);
             } else {
                 console.warn("[Map.jsx] Container dimensions are zero, cannot calculate auto-zoom.");
             }
        }
        // End Auto Zoom

      } else {
        console.log("[Map.jsx] No valid coordinates for path drawing/zooming.");
      }
    } else {
      // No path coordinates, potentially reset zoom to default view
       if (svgRef.current && zoomRef.current) {
           svgRef.current.transition()
               .duration(500)
               .call(zoomRef.current.transform, d3.zoomIdentity); // Reset to identity transform (1x scale, 0,0 translate)
            console.log("[Map.jsx] No path coordinates, resetting zoom.");
       }
    }

  }, [svgContent, pathCoordinates]); // Re-run when SVG content or path coordinates change

  // Render Logic
  return (
    <Box
      ref={svgContainerRef}
      width="100%"
      // maxWidth="900px"
      maxHeight="65vh"
      overflow="hidden"
      border="1px solid #ccc"
      borderRadius="8px"

      bgcolor="#ffffff"
      
      
      sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
       
      '& svg': { // Style the SVG element itself via CSS
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      scale: scale, // Apply the scale prop to the SVG
      height: {xs: '30vh',sm:'45vh', md:'55vh', lg:'65vh'},
      preserveAspectRatio: 'xMidYMid meet'
//
        }
      }}
    >
      {/* Loading Indicator */}
      {isLoading && (
          <Box position="absolute" top="50%" left="50%" sx={{ transform: 'translate(-50%, -50%)' }}>
              <CircularProgress />
          </Box>
      )}

      {/* Error Message Display */}
      {!isLoading && error && (
          <Typography color="error" textAlign="center" padding={2}>
              {error}
          </Typography>
      )}

      {/* Container for SVG Injection */}
      {/* This div will have its innerHTML set */}
      <div
          ref={svgContainerRef}
          key={mapPath} // Force re-creation when map changes to clear old SVG/listeners
          style={{width: '100%', height: '100%', display: (isLoading || error) ? 'none' : 'block' }} // Hide div until content ready
      />

       {/* Initial Placeholder (if no mapPath is provided at all) */}
       {!mapPath && !isLoading && !error && (
            <Typography color="textSecondary" textAlign="center" padding={2}>
                Map will appear here once navigation starts.
            </Typography>
       )}
    </Box>
  );
};

export default memo(Map);

