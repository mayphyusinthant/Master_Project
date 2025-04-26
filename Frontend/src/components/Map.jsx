
import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material'; // For loading/error display
import * as d3 from 'd3'; // Using D3 for SVG manipulation

// Component to display the SVG map and draw the navigation path
const Map = ({ map, pathCoordinates }) => {
  const svgContainerRef = useRef(null);
  const [svgContent, setSvgContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Effect to load the SVG file content when the 'map' prop changes
  useEffect(() => {
    // Reset states when map prop changes or is invalid
    setSvgContent(null);
    setError(null);
    setIsLoading(false);

    if (!map) {
        setError("No map file specified."); // Set error if map prop is missing
        return;
    }

    setIsLoading(true);
    console.log("[Map.jsx] Fetching SVG from:", map); // Debug

    // Fetch the SVG content from the provided path
    fetch(map)
      .then(response => {
        console.log("[Map.jsx] Fetch response status:", response.status, response.statusText); // Debug
        if (!response.ok) {
          throw new Error(`Failed to load SVG map: ${response.status} ${response.statusText}`);
        }
        return response.text();
      })
      .then(text => {
        console.log("[Map.jsx] Successfully fetched SVG content."); // Debug
        setSvgContent(text); // Store raw SVG content string
        setError(null); // Clear any previous error
      })
      .catch(err => {
        console.error("[Map.jsx] Error fetching SVG:", err);
        setError(`Could not load map SVG: ${err.message}`);
        setSvgContent(null); // Ensure no stale SVG is shown
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [map]); // Re-run effect only if the map prop changes

  // Draw or clear the path when coordinates change or SVG content loads/changes
  useEffect(() => {

    // Ensure the container ref is available and SVG content has been loaded
    if (!svgContent || !svgContainerRef.current) {
      return; // Exit if SVG isn't loaded or container isn't ready
    }

    // Select the main SVG element within the container using D3
    const svg = d3.select(svgContainerRef.current).select('svg');

    // Check if the SVG element was successfully selected
    if (svg.empty()) {
      console.warn("[Map.jsx] SVG element not found yet. Path drawing might be delayed.");
      return;
    }

    // Path Drawing Logic ---------------------------------------------------------
    const pathId = 'navigation-path'; // Unique ID for the polyline element
    const startMarkerId = 'nav-start-marker';
    const endMarkerId = 'nav-end-marker';

    // Always remove any existing path and markers first
    svg.select(`#${pathId}`).remove();
    svg.select(`#${startMarkerId}`).remove();
    svg.select(`#${endMarkerId}`).remove();


    // console.log("[Map.jsx] Path Coordinates Received for drawing:", pathCoordinates);

    // Check if we have valid coordinates (at least two points needed for a line)
    if (pathCoordinates && Array.isArray(pathCoordinates) && pathCoordinates.length > 1) {
      // Filter out any potentially invalid coordinate pairs
      const validCoords = pathCoordinates.filter(p => Array.isArray(p) && p.length === 2 && !isNaN(p[0]) && !isNaN(p[1]));

        // Only draw if we still have enough valid points after filtering
        if (validCoords.length > 1) {
            // Format the coordinates array into a space-separated string "x1,y1 x2,y2 ..."
            const pointsString = validCoords
                .map(coord => `${coord[0]},${coord[1]}`)
                .join(' ');

            // Append a new polyline element to the SVG for the path
            svg.append('polyline')
                .attr('id', pathId)
                .attr('points', pointsString)
                .attr('fill', 'none') // Don't fill the shape defined by the line
                .attr('stroke', 'purple') // Path color
                .attr('stroke-width', 5) // Path thickness
                .attr('stroke-opacity', 0.9) // Make it slightly less opaque if desired
                .attr('stroke-linecap', 'round') // Style for line endings
                .attr('stroke-linejoin', 'round'); // Style for line corners

            // Add markers for start and end points
            // Start marker
            svg.append('circle')
               .attr('id', startMarkerId)
               .attr('cx', validCoords[0][0])
               .attr('cy', validCoords[0][1])
               .attr('r', 8) // Radius of the marker
               .attr('fill', 'lime')
               .attr('stroke', 'black')
               .attr('stroke-width', 1.5);

            // End marker
            svg.append('circle')
               .attr('id', endMarkerId)
               .attr('cx', validCoords[validCoords.length - 1][0])
               .attr('cy', validCoords[validCoords.length - 1][1])
               .attr('r', 8) // Radius of the marker
               .attr('fill', 'red')
               .attr('stroke', 'black')
               .attr('stroke-width', 1.5);
        } else {
            // console.log("[Map.jsx] Not enough valid coordinates to draw a line after filtering.");
        }
    } else {
        // console.log("[Map.jsx] No valid path coordinates provided or path has less than 2 points.");
    }
    // End Path Drawing Logic

  }, [svgContent, pathCoordinates]); // Re-run effect if SVG content or coordinates change


  return (
    <Box
      ref={svgContainerRef}
      width="90%"
      maxWidth="900px"
      maxHeight="75vh"
      border="1px solid #ccc"
      borderRadius="8px"
      overflow="auto"
      bgcolor="#ffffff"
      mt={2}
      mb={2}
      sx={{ // Use sx prop for responsive/dynamic styling
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        minHeight: '400px',
        '& svg': { // Style the SVG element itself via CSS
          display: 'block',
          width: '100%',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 2px)',
        }
      }}
    >
      {isLoading && <CircularProgress />}
      {!isLoading && error && (
          <Typography color="error" textAlign="center" padding={2}>
              {error}
          </Typography>
      )}
      {!isLoading && !error && svgContent && (
        <div key={map} style={{width: '100%', height: '100%'}} dangerouslySetInnerHTML={{ __html: svgContent }} />
      )}
      {!isLoading && !error && !svgContent && map && (
          <Typography color="textSecondary" textAlign="center" padding={2}>
              Map loaded but content appears empty. Check SVG file.
          </Typography>
      )}
       {!map && (
            <Typography color="textSecondary" textAlign="center" padding={2}>
                Please select a floor or route to display the map.
            </Typography>
       )}
    </Box>
  );
};

export default Map;
