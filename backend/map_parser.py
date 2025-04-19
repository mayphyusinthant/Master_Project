import os.path
import scipy
import numpy
import networkx as nx
import svgelements
import matplotlib
from svgelements import SVG

"""
    SVG map parser. Parsing all the floor maps from static folder
"""

    # Parse the SVG map to get the graph data (nodes and edges)
def svg_map_parse(svg_map):
    if not os.path.exists(svg_map):
        print(f"Error: SVG file not found: {svg_map}")
        return None

    try:
        svg = svgelements.SVG.parse(svg_map)
    except Exception as e:
        print(f"Error parsing SVG file: {svg_map} - {e}")
        return None

    graph = nx.Graph()
    nodes = {}
    edges = []

    # Extracting rect as nodes
    for element in svg.elements():
        if isinstance(element, svgelements.Rect):
            if hasattr(element, 'id'):
                rect_type = element.id
            else:
                continue

            if hasattr(element, 'cost'):
                cost = float(element.cost)
            else:
                continue

            node_id = element.id if hasattr(element, 'id') else f"rect_{element.x:.2f}_{element.y:2f}"
            nodes[node_id] = {
                'x': float(element.x),
                'y': float(element.y),
                'width': float(element.width),
                'height': float(element.height),
                'center_x': float(element.x + element.width / 2),
                'center_y': float(element.y + element.height / 2),
                'type': rect_type,
                'cost': cost,
            }
            graph.add.node(node_id, **nodes[node_id])

    # Extracting edges, connect rect centers
    for element in svg.elements():
        if isinstance(element, svgelements.Line):
            line_start = (float(element.x1), float(element.y1))
            line_end = (float(element.x2), float(element.y2))

            start_node = None
            end_node = None
            for node_id in nodes:
                node = nodes[node_id]
                # Checking if the line start or end point is close to center of a rect
                if proximity(line_start, (node['center_x'], node['center_y'])):
                    start_node = node_id
                if proximity(line_end, (node['center_x'], node['center_y'])):
                    end_node = node_id

            if start_node and end_node:
                edges.append((start_node, end_node))
                graph.add_edge(start_node, end_node)

    return graph

    # Checking if 2 points are close to each other within given tolerance. Adjust as required
    # point1(tuple) = (x,y) coordinates of the first point
    # point2(tuple) = (x,y) coordinates of the second point
    # Tolerance = Max distance the points to be considered close
def proximity(point1, point2, tolerance=10.0):
    # Return bool
    return (abs(point1[0] - point2[0]) < tolerance and
            abs(point1[1] - point2[1]) < tolerance)

    # Processing all svg maps in the static directory, specified correct svg file name in the folder
def process_maps(directory="static"):
    # Dictionary for each floor graphs
    all_graphs = {}
    for floor_name in ['Floor A', 'Floor B', 'Floor C', 'Floor D', 'Floor E', 'Floor F', 'Floor G', 'Floor H']:
        svg_file = os.path.join(directory, f"{floor_name}.svg")
        graph = svg_map_parse(svg_file)
        if graph:
            all_graphs[floor_name] = graph
            print(f"Successfully parsed: {svg_file}")
        else:
            print(f"Failed to parse: {svg_file}")

    return all_graphs
