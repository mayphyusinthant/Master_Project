import os
import os.path
import networkx as nx
import svgelements
import math
import traceback

DEFAULT_CONNECTION_TOLERANCE = 100.0
DEFAULT_INTER_FLOOR_WEIGHT = 2.0

def svg_map_parse(svg_map_path, floor_letter):
    """
    Parses an SVG file, extracts rectangular elements, adds them as nodes
    to a graph, and connects adjacent nodes on the same floor.

    :param svg_map_path: Path to the SVG file.
    :param floor_letter: The letter representing the floor (e.g., 'A', 'B').
    :return: networkx.Graph or None if parsing fails.
    """
    graph = nx.Graph()
    nodes_dict = {}
    rects_list = []

    if not os.path.exists(svg_map_path):
        print(f"Error: SVG file not found: {svg_map_path}")
        return None
    try:
        svg = svgelements.SVG.parse(svg_map_path)
    except Exception as e:
        print(f"Error parsing SVG file: {svg_map_path}")
        print(traceback.format_exc())
        return None

    element_count = 0
    print(f"    Reading elements for Floor {floor_letter}...")
    for element in svg.elements():
        # Process only rectangle elements
        if isinstance(element, svgelements.Rect):
            element_count += 1
            svg_id = None
            cost_value = 1.0 # Default cost/weight

            # Extract attributes safely
            element_x = float(getattr(element, 'x', 0.0))
            element_y = float(getattr(element, 'y', 0.0))
            element_width = float(getattr(element, 'width', 0.0))
            element_height = float(getattr(element, 'height', 0.0))

            # Get the SVG ID - skip element if it has no ID or empty ID
            if hasattr(element, 'id') and element.id:
                svg_id = element.id.strip()
                if not svg_id:
                    # print(f"Warning: Skipping Rect with empty ID in {svg_map_path}") # Less verbose
                    continue
            else:
                # print(f"Warning: Skipping Rect without ID in {svg_map_path}") # Less verbose
                continue

            # Generate unique node ID
            unique_node_id = f"{floor_letter}_{svg_id}_{element_x:.1f}_{element_y:.1f}_{element_count}"
            center_x = element_x + element_width / 2
            center_y = element_y + element_height / 2

            # Node data dictionary
            node_data = {
                'x': element_x, 'y': element_y,
                'width': element_width, 'height': element_height,
                'center_x': center_x, 'center_y': center_y,
                'type': svg_id,  # Use original SVG ID as 'type'
                'cost': cost_value,
                'svg_id': svg_id,  # Store original svg id explicitly
                'floor': floor_letter
            }

            # Add node to the graph
            if unique_node_id in graph:
                 print(f"Warning: Duplicate node ID generated: {unique_node_id}. Check SVG elements.")
            graph.add_node(unique_node_id, **node_data)
            nodes_dict[unique_node_id] = node_data
            rects_list.append((unique_node_id, node_data))
    print(f"    Found {len(rects_list)} rectangle elements for Floor {floor_letter}.")

    # --- Add Edges Between Adjacent Rectangles on the SAME Floor ---
    edge_count = 0
    print(f"    Checking adjacency for Floor {floor_letter}...")
    for i in range(len(rects_list)):
        for j in range(i + 1, len(rects_list)):
            node_id1, rect1_data = rects_list[i]
            node_id2, rect2_data = rects_list[j]

            type1_lower = rect1_data.get('type','').lower()
            type2_lower = rect2_data.get('type','').lower()

            # Don't connect two obstacle nodes
            if 'obstacle' in type1_lower and 'obstacle' in type2_lower:
               continue

            # Check adjacency using the helper function
            if are_adjacent(rect1_data, rect2_data):
                center_x1, center_y1 = rect1_data['center_x'], rect1_data['center_y']
                center_x2, center_y2 = rect2_data['center_x'], rect2_data['center_y']
                distance = math.sqrt((center_x1 - center_x2)**2 + (center_y1 - center_y2)**2)
                edge_weight = max(distance, 0.1) # Use distance as weight, ensure non-zero

                # Add edge if it doesn't already exist
                if not graph.has_edge(node_id1, node_id2):
                    graph.add_edge(node_id1, node_id2, weight=edge_weight)
                    edge_count += 1

    print(f"    Added {edge_count} same-floor edges for Floor {floor_letter}.")
    return graph

def are_adjacent(rect1, rect2, tolerance=1.5):
    """
    Checking is two rectangles are touching, overlapping or very close to each other

    :param rect1: First rectangle(node)
    :param rect2: Second rectangle(node)
    :param tolerance: How far apart they can be when checking for neighbours
    :return: bool: True if adjacent, False if not
    """

    left1, right1 = rect1['x'], rect1['x'] + rect1['width']
    top1, bottom1 = rect1['y'], rect1['y'] + rect1['height']
    left2, right2 = rect2['x'], rect2['x'] + rect2['width']
    top2, bottom2 = rect2['y'], rect2['y'] + rect2['height']

    # Check for separation beyond tolerance
    x_separated = (left1 >= right2 + tolerance) or (left2 >= right1 + tolerance)
    y_separated = (top1 >= bottom2 + tolerance) or (top2 >= bottom1 + tolerance)

    # If they are not separated in either direction, they are considered adjacent
    return not (x_separated or y_separated)

def create_campus_graph(directory="static", inter_floor_weight=DEFAULT_INTER_FLOOR_WEIGHT):
    """
    Creates a single combined graph for all floors, including inter-floor connections
    based on proximity and matching specific IDs of stairs/elevators.

    :param directory: All the SVG files
    :param inter_floor_weight: Default weight for floor connection edge
    :return: campus_graph: NetworkX graph combined with all the maps
    """

    campus_graph = nx.Graph()
    floor_graphs = {}
    floor_letters = []

    floor_files_ordered = [
        ('A', 'Floor_A.svg'), ('B', 'Floor_B.svg'), ('C', 'Floor_C.svg'),
        ('D', 'Floor_D.svg'), ('E', 'Floor_E.svg'), ('F', 'Floor_F.svg'),
        ('G', 'Floor_G.svg'), ('H', 'Floor_H.svg')
    ]

    print(f"\n--- Creating Combined Campus Graph from: {directory} ---")
    #print(f"Using Inter-Floor Weight: {inter_floor_weight}")

    # 1. Parse each floor and add to the main graph
    for floor_letter, floor_filename in floor_files_ordered:
        svg_file_path = os.path.join(directory, floor_filename)
        print(f"  Parsing {svg_file_path}...")
        graph = svg_map_parse(svg_file_path, floor_letter)
        if graph is not None and isinstance(graph, nx.Graph):
            floor_graphs[floor_letter] = graph
            floor_letters.append(floor_letter)
            print(f"    Parsed Floor {floor_letter} ({graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges)")
            campus_graph.add_nodes_from(graph.nodes(data=True))
            campus_graph.add_edges_from(graph.edges(data=True))
        else:
            print(f"    Failed to parse {floor_filename}.")

    if not campus_graph:
        print("ERROR: No floors parsed. Cannot create campus graph.")
        return None

    print(f"\n  Combined graph: {campus_graph.number_of_nodes()} nodes, {campus_graph.number_of_edges()} edges (before inter-floor).")

    # 2. Add Inter-Floor Connections
    print(f"\n  Adding inter-floor connections...")
    # Identify potential vertical connection nodes by specific ID prefixes
    connection_ids_prefixes = ['stairs', 'elevator'] # Case-insensitive check below

    connection_nodes = []
    for node_id, data in campus_graph.nodes(data=True):
        node_type = data.get('type', '') # This is the SVG ID
        if node_type and any(node_type.lower().startswith(prefix) for prefix in connection_ids_prefixes):
             connection_nodes.append((node_id, data))

    print(f"    Found {len(connection_nodes)} potential connection nodes (stairs/elevators).")
    if not connection_nodes:
        print("    WARNING: No nodes identified as stairs/elevators based on ID prefixes.")
        print(f"    Check SVG IDs match prefixes: {connection_ids_prefixes}")

    connection_count = 0
    # Iterate through adjacent floors
    for i in range(len(floor_letters) - 1):
        current_floor = floor_letters[i]
        next_floor = floor_letters[i+1]
        print(f"    Checking connections between Floor {current_floor} and Floor {next_floor}...")

        current_floor_connections = [(nid, d) for nid, d in connection_nodes if d.get('floor') == current_floor]
        next_floor_connections = [(nid, d) for nid, d in connection_nodes if d.get('floor') == next_floor]

        # DEBUG: List found connection nodes per floor
        print(f"      Floor {current_floor} Connection Nodes ({len(current_floor_connections)}): {[d.get('type') for nid, d in current_floor_connections]}")
        print(f"      Floor {next_floor} Connection Nodes ({len(next_floor_connections)}): {[d.get('type') for nid, d in next_floor_connections]}")

        # Compare nodes between the two floors
        for node1_id, data1 in current_floor_connections:
            for node2_id, data2 in next_floor_connections:
                type1 = data1.get('type') # Specific ID like 'stairs_Main'
                type2 = data2.get('type')

                # Specific IDs must match EXACTLY (case-sensitive)
                if type1 and type1 == type2:
                    # print(f"      Comparing: {node1_id} (ID: {type1}) <-> {node2_id} (ID: {type2}) - IDs Match") # DEBUG

                    cx1, cy1 = data1.get('center_x'), data1.get('center_y')
                    cx2, cy2 = data2.get('center_x'), data2.get('center_y')

                    # Check if coordinates exist
                    if all(isinstance(coord, (int, float)) for coord in [cx1, cy1, cx2, cy2]):
                        # Original distance calculation
                        dist = math.sqrt((cx1 - cx2) ** 2 + (cy1 - cy2) ** 2)

                        # DEBUG for successful connection
                        print(f"        CONNECTING: {node1_id} (Floor {current_floor}, ID: {type1}) <-> {node2_id} (Floor {next_floor}, ID: {type2}) | Dist: {dist:.2f}")

                        if not campus_graph.has_edge(node1_id, node2_id):
                            campus_graph.add_edge(node1_id, node2_id, weight=inter_floor_weight)
                            connection_count += 1
                    else:
                        print(f"Warning: Missing coordinates for {node1_id} or {node2_id}. Cannot connect matching ID '{type1}' without coordinates.")

    print(f"  Added {connection_count} inter-floor connection edges.")
    print(f"--- Finished Creating Campus Graph. Total nodes: {campus_graph.number_of_nodes()}, Total edges: {campus_graph.number_of_edges()} ---")

    if campus_graph.number_of_nodes() == 0:
        print("ERROR: Final campus graph has no nodes!")
        return None
    if campus_graph.number_of_edges() == 0:
        print("Warning: Final campus graph has no edges!")

    return campus_graph
