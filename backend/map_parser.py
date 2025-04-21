import os.path
import networkx as nx
import svgelements

""" SVG map parser. Takes in one map as an argument. Returns NextworX graph. """
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
    element_count = 0
    for element in svg.elements():
        if isinstance(element, svgelements.Rect):
            element_count += 1
            element_x = 0.0
            element_y = 0.0
            svg_id = None
            node_id = None
            cost_value = None

            # Get coordinates
            if hasattr(element, 'x'):
                element_x = float(element.x)
            if hasattr(element, 'y'):
                element_y = float(element.y)

            # Check svg id
            if hasattr(element, 'id') and element.id:
                svg_id = element.id
                # print(f"Found rect with svg_id: {svg_id} at ({element_x:.2f}, {element_y:.2f})")
            else:
                # print(f"Skipping rect without id at ({element_x:.2f}, {element_y:.2f})")
                continue

            # Checking cost in the elements values/attributes dictionary
            if 'cost' in element.values:
                try:
                    cost_value = float(element.values['cost'])
                except (ValueError, TypeError):
                    print(f"Warning: Could not convert cost '{element.values['cost']} to float for element {svg_id} at ({element_x:.2f}, {element_y:.2f}). Skipping.")
                    continue
            else:
                print(f"Skipping rect {svg_id} at ({element_x:.2f}, {element_y:.2f}) because it lacks a 'cost' attribute.")
                continue

            # Generate UNIQUE NODE ID
            # Combine SVG_ID and its coordinates
            unique_node_id = f"{svg_id}_{element_x:.2f}_{element_y:.2f}_{element_count}"

            # Data retrieved from a rect
            nodes_data = {
                'x': element_x,
                'y': element_y,
                'width': float(element.width),
                'height': float(element.height),
                'center_x': (element_x + float(element.width) / 2),  # Trying to get the middle of the rect
                'center_y': (element_y + float(element.height) / 2),
                'type': svg_id,  # Name
                'cost': cost_value,
                'svg_id': svg_id
            }

            # Add the node with the unique id
            if unique_node_id in graph.nodes:
                print(f" Warning: Duplicate unique node ID generated: {unique_node_id}. Check SVG for identical elements or adjust ID generation.")
            graph.add_node(unique_node_id, **nodes_data)
            nodes[unique_node_id] = nodes_data
            rects.append((unique_node_id, nodes_data))
            # print(f" Added node: {unique_node_id} with data: {nodes_data}")

    print(f"--- Finished parsing {os.path.basename(svg_map)} ---")

    # --- Adjacency Logic (Uses are_adjacent function) ---
    edge_count = 0
    # Check if are_adjacent is defined before calling it
    if 'are_adjacent' in globals() or 'are_adjacent' in locals():
        for i in range(len(rects)):
            for j in range(i + 1, len(rects)):
                node_id1, rect1_data = rects[i]
                node_id2, rect2_data = rects[j]
                if are_adjacent(rect1_data, rect2_data):  # Use your adjacency check
                    cost_node1 = rect1_data['cost']
                    cost_node2 = rect2_data['cost']
                    average_cost = (cost_node1 + cost_node2) / 2 if (cost_node1 + cost_node2) > 0 else 0
                    if not graph.has_edge(node_id1, node_id2):
                        graph.add_edge(node_id1, node_id2, weight=average_cost)
                        edge_count += 1
    else:
        print("Warning: are_adjacent function not found. Skipping edge creation.")
    print(f"--- Finished Adjacency. Added {edge_count} edges. ---")

    return graph

def are_adjacent(rect1, rect2, tolerance=1.0):
    # Calculate the boundaries of the rectangles
    left1, right1 = rect1['x'], rect1['x'] + rect1['width']
    top1, bottom1 = rect1['y'], rect1['y'] + rect1['height']
    left2, right2 = rect2['x'], rect2['x'] + rect2['width']
    top2, bottom2 = rect2['y'], rect2['y'] + rect2['height']

    # Check if bounding boxes (expanded by tolerance) intersect
    x_overlap_possible = (left1 < right2 + tolerance) and (right1 + tolerance > left2)
    y_overlap_possible = (top1 < bottom2 + tolerance) and (bottom1 + tolerance > top2)

    if not (x_overlap_possible and y_overlap_possible):
        return False # They are too far apart even with tolerance

    # Calculate actual overlap distance (negative if separated, zero if touching, positive if overlapping)
    dx = min(right1, right2) - max(left1, left2)
    dy = min(bottom1, bottom2) - max(top1, top2)

    # Check for actual area overlap (positive overlap on both axes)
    if dx > 0 and dy > 0:
        return True # They overlap in area

    # Check if they touch along a side within the given tolerance
    # Touching on X-axis means dy is positive (overlap in Y) and dx is close to zero
    touching_along_x = dy > -tolerance and abs(dx) < tolerance
    # Touching on Y-axis means dx is positive (overlap in X) and dy is close to zero
    touching_along_y = dx > -tolerance and abs(dy) < tolerance

    if touching_along_x or touching_along_y:
        return True # They touch along a side

    return False # Otherwise, they are separate


    # Processing all svg maps in the static directory, specified correct svg file name in the folder
def process_maps(directory="static"):
    # Dictionary for each floor graphs
    all_graphs = {}
    # Define floor names explicitly
    floor_names = ['Floor_A.svg', 'Floor_B.svg', 'Floor_C.svg', 'Floor_D.svg',
                   'Floor_E.svg', 'Floor_F.svg', 'Floor_G.svg', 'Floor_H.svg']
    for floor_name in floor_names:
        # Construct full path to the SVG file
        svg_file = os.path.join(directory, floor_name)  # Corrected: use floor_name directly
        # Call svg_map_parse for each file
        graph = svg_map_parse(svg_file)
        # Check if parsing was successful (graph is not None)
        if graph is not None:  # Check specifically for None, as empty graph is valid
            all_graphs[floor_name] = graph
            print(f"Successfully parsed: {svg_file}")
        else:
            # Print failure message if graph is None
            print(f"Failed to parse: {svg_file}")
    return all_graphs
