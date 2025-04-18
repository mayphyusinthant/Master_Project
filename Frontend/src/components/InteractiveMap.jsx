import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import { Box } from '@mui/material';

const BootstrapTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#2F3542",
    fontSize: '14px',
    padding: '8px 12px',
    maxWidth: '300px',
  },
}));

function InteractiveMap({ map, roomData = [] }) {
  const containerRef = useRef();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    d3.xml(map).then((xml) => {
      containerRef.current.innerHTML = '';

      const svgNode = xml.documentElement;
      svgNode.setAttribute('width', '100%');
      svgNode.setAttribute('height', '100%');
      
      // Ensure we have a proper viewBox
      if (!svgNode.hasAttribute('viewBox')) {
        const width = svgNode.getAttribute('width') || 1000;
        const height = svgNode.getAttribute('height') || 1000;
        svgNode.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }

      const importedNode = document.importNode(svgNode, true);
      containerRef.current.appendChild(importedNode);

      // Ensure the SVG fills the container
      const svg = d3.select(containerRef.current).select('svg');
      svg
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('preserveAspectRatio', 'xMidYMid meet');

      // Add style for highlighting
      const style = document.createElement("style");
      style.innerHTML = `
        .highlight path, .highlight polygon, .highlight rect, .highlight polyline, .highlight line { 
          fill: purple !important; 
          stroke: purple !important; 
        }
        .highlight text { 
          fill: white !important; 
        }
      `;
      document.head.appendChild(style);

      // Select ALL potential interactive elements
      const interactiveElements = d3.select(containerRef.current)
        .selectAll("g, path, rect, polygon, text");
      
      interactiveElements
        .on("mouseover", function(event) {
          // Try to get the ID from the element or its parent
          let id = this.id;
          
          // If no ID, try to get text content if it's a text element
          if (!id && this.tagName === 'text') {
            id = this.textContent.trim();
          }
          
          // If still no ID, try to see if parent g has an ID
          if (!id && this.parentNode && this.parentNode.id) {
            id = this.parentNode.id;
          }
          
          // Find matching room data if available
          const matchedRoom = roomData.find(room => 
            room.roomId == id || room.roomName == id
          );

          // Create tooltip content
          let content = '';
          if (matchedRoom) {
            content = `
              <strong>${matchedRoom.roomName||'Room'}</strong><br><strong>Room Type:</strong> ${matchedRoom.type || 'N/A'}<br>
              ${matchedRoom.floor || 'N/A'}<br><br>
              ${matchedRoom.description ? `<strong>Description</strong><br>${matchedRoom.description}` : ''}
            `;
          } else {
            // Default text if no match found
            content = `<strong>${id || 'Room'}</strong>`;
          }
          
          // Apply highlighting to the element or its parent g if available
          const elementToHighlight = this.tagName === 'g' ? 
            d3.select(this) : 
            d3.select(this.closest('g') || this);
          
          elementToHighlight.classed("highlight", true);
          
          // Set tooltip properties
          setTooltipContent(content);
          setTooltipOpen(true);
          setTooltipPosition({
            x: event.clientX,
            y: event.clientY - 15
          });
        })
        .on("mousemove", function(event) {
          // Update position on mouse move using clientX/Y for viewport-relative positioning
          setTooltipPosition({
            x: event.clientX,
            y: event.clientY - 15
          });
        })
        .on("mouseout", function() {
          // Remove highlighting
          const elementToUnhighlight = this.tagName === 'g' ? 
            d3.select(this) : 
            d3.select(this.closest('g') || this);
          
          elementToUnhighlight.classed("highlight", false);
          setTooltipOpen(false);
        });
    }).catch(error => {
      console.error("Error loading SVG:", error);
    });
  }, [map, roomData]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 2
      }}
    >
      {/* SVG Container - Fixed width container with responsive behavior */}
      <Box
        sx={{
          width: '100%',
          height: '600px',
          border: '2px solid black',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        />

        {/* Tooltip */}
        {tooltipOpen && (
          <div
            style={{
              position: 'fixed',
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            <BootstrapTooltip 
              open={tooltipOpen} 
              title={<div dangerouslySetInnerHTML={{ __html: tooltipContent }} />} 
              placement="top"
            >
              <span></span>
            </BootstrapTooltip>
          </div>
        )}
      </Box>
    </Box>
  );
}

export default InteractiveMap;