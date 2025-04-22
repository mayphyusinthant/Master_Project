import os.path
import networkx as nx
import svgelements
import math

def svg_map_parse(svg_map_path, floor_letter):
    """
    Parses an SVG file and extracts rectangular elements as nodes in a NetworkX graph,
    connecting adjacent rectangles with edges.
    Generates unique node IDs based on floor + svg_id + coordinates + counter.
    Stores the original SVG id as the 'type' attribute and floor letter as 'floor'.

    :param svg_map_path: Path to SVG file
    :param floor_letter: The letter representing the floor
    :return: networkx.Graph: A NetworkX graph representing the map, or None on error
    """
    graph = nx.Graph()
    nodes = {}
    rects = []
    if not os.path.exists(svg_map_path):
        print(f"Error: SVG file not found: {svg_map_path}")
        return None
    try:
        svg = svgelements.SVG.parse(svg_map_path)
    except Exception as e:
        print(f"Error parsing SVG file: {svg_map_path} - {e}")
        return None

    element_count = 0
    for element in svg.elements():
        if isinstance(element, svgelements.Rect):
            element_count += 1
            svg_id = None;
            cost_value = None;
            element_x = 0.0;
            element_y = 0.0
            element_x = float(getattr(element, 'x', 0.0))
            element_y = float(getattr(element, 'y', 0.0))
            element_width = float(getattr(element, 'width', 0.0))
            element_height = float(getattr(element, 'height', 0.0))
            if hasattr(element, 'id') and element.id:
                svg_id = element.id
            else:
                continue
            cost_attr = element.values.get('cost')
            if cost_attr is not None:
                try:
                    cost_value = float(cost_attr)
                except (ValueError, TypeError):
                    continue
            else:
                continue

            # Generate unique node ID (including floor)
            unique_node_id = f"{floor_letter}_{svg_id}_{element_x:.2f}_{element_y:.2f}_{element_count}"

            # Add 'floor' attribute to node data
            nodes_data = {
                'x': element_x, 'y': element_y, 'width': element_width, 'height': element_height,
                'center_x': element_x + element_width / 2, 'center_y': element_y + element_height / 2,
                'type': svg_id,  # Original SVG ID (e.g., 'A17', 'stairs')
                'cost': cost_value,
                'svg_id': svg_id,  # Explicitly store original svg id
                'floor': floor_letter
            }
            if unique_node_id in graph.nodes: pass  # Optionally warn
            graph.add_node(unique_node_id, **nodes_data)
            nodes[unique_node_id] = nodes_data
            rects.append((unique_node_id, nodes_data))

    # Adjacency Logic
    edge_count = 0
    if 'are_adjacent' in globals() or 'are_adjacent' in locals():
        for i in range(len(rects)):
            for j in range(i + 1, len(rects)):
                node_id1, rect1_data = rects[i]
                node_id2, rect2_data = rects[j]
                if are_adjacent(rect1_data, rect2_data):
                    cost_node1 = rect1_data['cost'];
                    cost_node2 = rect2_data['cost']
                    average_cost = (cost_node1 + cost_node2) / 2 if (cost_node1 + cost_node2) > 0 else 0
                    if not graph.has_edge(node_id1, node_id2):
                        graph.add_edge(node_id1, node_id2, weight=average_cost)
                        edge_count += 1
    return graph

def are_adjacent(rect1, rect2, tolerance=1.0):
    """
    Checking if current node has any adjacent neighbours.
    Either within the given tolerance or overlapping.

    :param rect1: node1
    :param rect2: node2
    :param tolerance: space between
    :return: bool - True or False
    """
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

def process_maps(directory="static"):
    """
    Process all the svg maps in the static directory.
    Create a NetworkX graph that is used by pathfinding algorithm.

    :param directory: Path to directory
    :return: dictionary {filename: nx.Graph}
    """

    all_graphs = {}
    floor_names = ['Floor_A.svg', 'Floor_B.svg', 'Floor_C.svg', 'Floor_D.svg',
                   'Floor_E.svg', 'Floor_F.svg', 'Floor_G.svg', 'Floor_H.svg']
    print(f"\n--- Processing Maps in Directory: {directory} ---")
    for floor_filename in floor_names:
        svg_file_path = os.path.join(directory, floor_filename)
        # Extract floor letter (e.g., 'A' from 'Floor_A.svg')
        try:
            # Split by '_' -> ['Floor', 'A.svg'], take second part -> 'A.svg'
            # Split by '.' -> ['A', 'svg'], take first part -> 'A'
            floor_letter = floor_filename.split('_')[1].split('.')[0]
        except IndexError:
            print(f"Warning: Could not extract floor letter from filename '{floor_filename}'. Skipping.")
            continue

        # Ensure svg_map_parse is available
        if 'svg_map_parse' in globals() or 'svg_map_parse' in locals():
            # Pass the floor letter to the parser
            graph = svg_map_parse(svg_file_path, floor_letter)
        else:
            print(f"Error: svg_map_parse function not found. Cannot parse {svg_file_path}")
            graph = None  # Treat as failure if parser is missing

        if graph is not None:
            # Store graph using the original filename as key
            all_graphs[floor_filename] = graph
            print(f"Successfully parsed: {svg_file_path} (Floor {floor_letter})")
        else:
            print(f"Failed to parse: {svg_file_path}")
    print(f"--- Finished Processing Maps. Parsed {len(all_graphs)} graphs. ---")
    return all_graphs

# ADJUST THE TOLERANCE WHEN TESTING!!!! <-----------------------------------------------------------------------------------------------------
def create_campus_graph(directory="static", connection_tolerance=100.0, inter_floor_weight=10.0):
    """
    Creates a single combined graph for all floors, including inter-floor connections.

    :param directory: Path to the directory containing floor SVG files
    :param connection_tolerance: Max distance between centers of stairs/elevators on adjacent floors to be considered connected
    :param inter_floor_weight: The weight/cost assigned to edges connecting floors
    :return: networkx.Graph: A single graph representing the entire campus, or None on error
    """

    campus_graph = nx.Graph()
    floor_graphs = {} # Temporarily store individual floor graphs
    floor_letters = [] # Store the letters of successfully parsed floors

    # Define expected floor files and their order (important for adjacency)
    floor_files_ordered = [
        ('A', 'Floor_A.svg'), ('B', 'Floor_B.svg'), ('C', 'Floor_C.svg'),
        ('D', 'Floor_D.svg'), ('E', 'Floor_E.svg'), ('F', 'Floor_F.svg'),
        ('G', 'Floor_G.svg'), ('H', 'Floor_H.svg')
    ]

    print(f"\n--- Creating Combined Campus Graph from: {directory} ---")

    # 1. Parse each floor individually
    for floor_letter, floor_filename in floor_files_ordered:
        svg_file_path = os.path.join(directory, floor_filename)
        print(f"  Parsing {svg_file_path}...")
        graph = svg_map_parse(svg_file_path, floor_letter)
        if graph is not None:
            floor_graphs[floor_letter] = graph
            floor_letters.append(floor_letter)
            print(f"    Parsed Floor {floor_letter} with {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges.")
            # Add nodes and same-floor edges to the main campus graph
            campus_graph.add_nodes_from(graph.nodes(data=True))
            campus_graph.add_edges_from(graph.edges(data=True))
        else:
            print(f"    Failed to parse {floor_filename}.")

    if not campus_graph:
        print("ERROR: No floors were parsed successfully. Cannot create campus graph.")
        return None

    print(f"\n  Combined graph has {campus_graph.number_of_nodes()} nodes and {campus_graph.number_of_edges()} edges before inter-floor connections.")

    # 2. Add Inter-Floor Connections (Stairs/Elevators)
    print(f"\n  Adding inter-floor connections (tolerance={connection_tolerance}, weight={inter_floor_weight})...")
    connection_nodes = [
        (node_id, data) for node_id, data in campus_graph.nodes(data=True)
        if data.get('type', '').upper() in ['STAIRS', 'ELEVATOR'] # <------ Add other types if needed
    ]
    connection_count = 0

    # Iterate through floor letters in order to check adjacent floors
    for i in range(len(floor_letters) - 1):
        current_floor = floor_letters[i]
        next_floor = floor_letters[i+1]

        # Get connection nodes for the current and next floor
        current_floor_connections = [(nid, d) for nid, d in connection_nodes if d.get('floor') == current_floor]
        next_floor_connections = [(nid, d) for nid, d in connection_nodes if d.get('floor') == next_floor]

        # Compare each connection node on current floor to those on the next floor
        for node1_id, data1 in current_floor_connections:
            for node2_id, data2 in next_floor_connections:
                # Show which nodes are being compared and their types
                print(f"      Comparing: {node1_id} (Type: {data1.get('type')}) <-> {node2_id} (Type: {data2.get('type')})")

                # Check if they are the same type (e.g., both 'stairs')
                type1 = data1.get('type')
                type2 = data2.get('type')
                if type1 == type2:
                    # Confirm types match
                    print(f"        Types match ('{type1}'). Checking distance...")
                    # Check if their centers are close enough horizontally
                    cx1, cy1 = data1.get('center_x', -1e9), data1.get('center_y', -1e9)
                    cx2, cy2 = data2.get('center_x', -1e9), data2.get('center_y', -1e9)

                    dist = math.sqrt((cx1 - cx2) ** 2 + (cy1 - cy2) ** 2)

                    # Show coordinates and calculated distance
                    print(f"          Coords1: ({cx1:.2f}, {cy1:.2f}), Coords2: ({cx2:.2f}, {cy2:.2f}), Dist: {dist:.2f}")

                    if dist < connection_tolerance:
                        # Confirm distance is within tolerance
                        print(f"          Distance OK ( < {connection_tolerance}). Adding edge.")
                        # Found a corresponding connection point, add edge
                        if not campus_graph.has_edge(node1_id, node2_id):
                            campus_graph.add_edge(node1_id, node2_id, weight=inter_floor_weight)
                            connection_count += 1
                            # Confirm edge addition
                            print(f"            Added connection: {node1_id} <-> {node2_id} (Weight: {inter_floor_weight})")
                        else:
                            # Indicate edge already exists
                            print(f"            Edge already exists between {node1_id} and {node2_id}.")
                    else:
                        # Indicate distance is too large
                        print(f"          Distance too large ( >= {connection_tolerance}). No edge added.")
                else:
                    # Indicate types don't match
                    print(f"        Types do not match ('{type1}' vs '{type2}'). Skipping.")

    print(f"  Added {connection_count} inter-floor connection edges.")
    print(f"--- Finished Creating Campus Graph. Total nodes: {campus_graph.number_of_nodes()}, Total edges: {campus_graph.number_of_edges()} ---")

    return campus_graph
