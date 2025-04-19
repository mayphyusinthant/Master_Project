import os.path
import networkx as nx
import svgelements

"""
    SVG map parser. Parsing all the floor maps from static folder
"""

    # Parse the SVG map to get the graph data (nodes and edges)
def svg_map_parse(svg_map):

    graph = nx.Graph()
    nodes = {}
    rects = []  # For adjacency check

    # Path check
    if not os.path.exists(svg_map):
        print(f"Error: SVG file not found: {svg_map}")
        return None

    # Try parsing
    try:
        svg = svgelements.SVG.parse(svg_map)
    except Exception as e:
        print(f"Error parsing SVG file: {svg_map} - {e}")
        return None

    # Extracting rect as nodes
    for element in svg.elements():
        if isinstance(element, svgelements.Rect):
            if hasattr(element, 'id'): # Looking for an id attribute
                rect_type = element.id
            else:
                continue # If no ID then skip

            if hasattr(element, 'cost'): # Looking for cost attribute
                cost = float(element.cost)
            else:
                continue # If no COST then skip

            # Assign an ID, if not found, create a unique id using x,y values
            node_id = element.id if hasattr(element, 'id') else f"rect_{element.x:.2f}_{element.y:2f}"
            # Data retrieved from a rect
            nodes_data = {
                'x': float(element.x), # X coords
                'y': float(element.y), # Y coords
                'width': float(element.width),
                'height': float(element.height),
                'center_x': float(element.x + element.width / 2), # Trying to get the middle of the rect
                'center_y': float(element.y + element.height / 2),
                'type': rect_type, # Name
                'cost': cost,
            }

            nodes[node_id] = nodes_data # Store data in a dictionary using node_id
            graph.add.node(node_id, **nodes_data) # Unpack nodes_data dictionary and add to NetworkX graph
            rects.append((node_id, nodes_data))

    # Extracting edges, connect rect centers
    for i in range(len(rects)):
        for j in range(i + 1, len(rects)):
            node_id1, rect1 = rects[i]
            node_id2, rect2 = rects[j]
            if are_adjacent(rect1, rect2):
                # Calculate the average cost
                cost_node1 = nodes[node_id1]['cost']
                cost_node2 = nodes[node_id2]['cost']
                average_cost = (cost_node1 + cost_node2) / 2
                graph.add_edge(node_id1, node_id2, weight=average_cost)

    return graph

    # STILL USED ??????????
def proximity(point1, point2, tolerance=10.0):
    # Return bool
    return (abs(point1[0] - point2[0]) < tolerance and
            abs(point1[1] - point2[1]) < tolerance)

    # Checking for neighbouring rectangles
def are_adjacent(rect1,rect2, tolerance=10.0):
        # Adjust tolerance as needed
        # Check for overlap
        if (rect1['x'] < rect2['x'] + rect2['width'] and
                rect1['x'] + rect1['width'] > rect2['x'] and
                rect1['y'] < rect2['y'] + rect2['height'] and
                rect1['y'] + rect1['height'] > rect2['y']):
            return True

        # Check for adjacency
        # rect1 left of rect2
        if (abs(rect1['x'] - (rect2['x'] + rect2['width'])) < tolerance and
                rect1['y'] < rect2['y'] + rect2['height'] and
                rect1['y'] + rect1['height'] > rect2['y']):
            return True
        # rect1 right of rect2
        if (abs((rect1['x'] + rect1['width']) - rect2['x']) < tolerance and
                rect1['y'] < rect2['y'] + rect2['height'] and
                rect1['y'] + rect1['height'] > rect2['y']):
            return True
        # rect1 above rect2
        if (abs(rect1['y'] - (rect2['y'] + rect2['height'])) < tolerance and
                rect1['x'] < rect2['x'] + rect2['width'] and
                rect1['x'] + rect1['width'] > rect2['x']):
            return True
        # rect1 below rect2
        if (abs((rect1['y'] + rect1['height']) - rect2['y']) < tolerance and
                rect1['x'] < rect2['x'] + rect2['width'] and
                rect1['x'] + rect1['width'] > rect2['x']):
            return True

        return False


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
