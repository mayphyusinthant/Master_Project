import heapq
import math


COST_PER_FLOOR_CHANGE = 2.2 # Heuristic cost equivalent for moving one floor vertically
INTER_FLOOR_EDGE_WEIGHT = 1.5 # Actual weight added to edges connecting stairs/elevators between floors

def heuristic(node1_data, node2_data):
    """
    Calculate the heuristic distance between two nodes, considering floors.

    :param node1_data: Attribute dictionary for the first node.
    :param node2_data: Attribute dictionary for the second node.
    :return: float - Heuristic distance.
    """
    dx = node1_data.get('center_x', 0.0) - node2_data.get('center_x', 0.0)
    dy = node1_data.get('center_y', 0.0) - node2_data.get('center_y', 0.0)

    # Calculate floor difference cost
    # Assign numeric levels to floors
    floor_map = {'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7}
    floor1_level = floor_map.get(node1_data.get('floor', 'A'), 0) # Default to 0 if floor missing
    floor2_level = floor_map.get(node2_data.get('floor', 'A'), 0) # Default to 0 if floor missing

    # Heuristic cost for vertical distance based on floor difference
    dz = abs(floor1_level - floor2_level) * COST_PER_FLOOR_CHANGE

    # Combine horizontal and vertical heuristic costs
    dist_sq = dx*dx + dy*dy + dz*dz # Use 3D distance concept
    return math.sqrt(dist_sq) if dist_sq >= 0 else 0.0

def reconstruct_path(came_from, current_node):
    """
    Reconstructing the path from came_from dictionary.
    :param came_from: Dictionary mapping nodes to the node they came from.
    :param current_node: Goal node where the path ends.
    :return: list - A path from start to goal
    """
    path = [current_node]
    while current_node in came_from:
        current_node = came_from[current_node]
        path.append(current_node)
    path.reverse()
    return path

def find_node(room_id, campus_graph):
    """
    Find the unique node ID in the combined campus graph corresponding to a room ID.
    Relies on the 'type' or 'svg_id' attribute matching the room_id input.
    Returns the first match found.

    :param room_id: room ID (case-insensitive)
    :param campus_graph: nx.Graph - Combined NetworkX graph for the whole campus.
    :return: string - Unique node ID, otherwise None.
    """
    if not campus_graph: return None
    target_room_id_upper = room_id.upper() # Case-insensitive comparison
    for node, data in campus_graph.nodes(data=True):
        # Check 'type' (original SVG id)
        node_type = data.get('type', '').upper()
        if node_type == target_room_id_upper:
            return node
        # Optional: Check 'svg_id' as fallback if stored differently
        node_svg_id = data.get('svg_id', '').upper()
        if node_svg_id == target_room_id_upper:
            return node

    return None

def is_room_node_type(node_type_str):
    """ Helper function to determine if a node type string represents a specific room. """
    if not node_type_str or len(node_type_str) < 2: return False
    # Starts with A-H and has a digit.
    return node_type_str[0].upper() in 'ABCDEFGH' and any(char.isdigit() for char in node_type_str[1:])

def pathfinding_algo(start_node_id, goal_node_id, campus_graph):
    """
    Find the shortest path using A* on a combined multi-floor campus graph.
    Handles traversal rules for rooms and allows using stairs/elevators for floor changes.

    :param start_node_id: Unique ID of the starting node in the campus graph.
    :param goal_node_id: Unique ID of the end node in the campus graph.
    :param campus_graph: Combined NetworkX graph for the whole campus.
                         Nodes must have 'floor', 'center_x', 'center_y', 'type' attributes.
                         Edges between floors (stairs/elevators) must exist with appropriate weights.
    :return: A list of node IDs representing the shortest path, or None if no path exists.
    """
    # Input validation
    if start_node_id not in campus_graph.nodes:
        print(f"Error: Start node '{start_node_id}' not found in the campus graph.")
        return None
    if goal_node_id not in campus_graph.nodes:
        print(f"Error: Goal node '{goal_node_id}' not found in the campus graph.")
        return None
    if start_node_id == goal_node_id:
        return [start_node_id]

    start_node_data = campus_graph.nodes[start_node_id]
    goal_node_data = campus_graph.nodes[goal_node_id]

    # Check if essential node data is present
    if 'floor' not in start_node_data or 'floor' not in goal_node_data:
         print("Error: Node data is missing 'floor' attribute required for heuristic.")
         return None
    if 'center_x' not in start_node_data or 'center_y' not in start_node_data:
         print("Error: Node data is missing coordinate attributes required for heuristic.")
         return None

    # A* Initialization
    # Start with open set
    open_set = [(heuristic(start_node_data, goal_node_data), start_node_id)]
    heapq.heapify(open_set)
    came_from = {}

    g_score = {node: float('inf') for node in campus_graph.nodes}
    g_score[start_node_id] = 0
    f_score = {node: float('inf') for node in campus_graph.nodes}
    f_score[start_node_id] = heuristic(start_node_data, goal_node_data)
    open_set_hash = {start_node_id}

    # Determine if navigation is cross-floor
    start_floor = start_node_data.get('floor')
    goal_floor = goal_node_data.get('floor')
    is_cross_floor = (start_floor != goal_floor)

    # A* main loop
    while open_set:
        current_f, current_node_id = heapq.heappop(open_set)

        if current_f > f_score[current_node_id]: continue # Already found better path

        if current_node_id == goal_node_id:
            print(" End goal reached!")
            return reconstruct_path(came_from, current_node_id)

        current_node_data = campus_graph.nodes[current_node_id]
        current_floor = current_node_data.get('floor')

        # Exploring neighbours (includes same-floor and inter-floor connections)
        for neighbor_node_id in campus_graph.neighbors(current_node_id):
            neighbor_node_data = campus_graph.nodes[neighbor_node_id]
            neighbor_floor = neighbor_node_data.get('floor')
            neighbor_type = neighbor_node_data.get('type', '').upper()

            # Check rules only if the neighbor is NOT the final destination
            if neighbor_node_id != goal_node_id:
                # Rule 1: Skip if neighbor is a specific room node
                if is_room_node_type(neighbor_type):
                    # print(f"    Skipping neighbor {neighbor_node_id} (type: {neighbor_type}) - Is Room Node") # Debug
                    continue

                # Rule 2: Handle Stairs/Elevators based on cross-floor need
                if neighbor_type in ['STAIRS', 'ELEVATOR']:
                    # Allow using stairs/elevator ONLY if the end goal is on a different floor
                    # OR if the current node is also a stair/elevator (allowing movement between levels)
                    current_type = current_node_data.get('type','').upper()
                    if not is_cross_floor and current_type not in ['STAIRS', 'ELEVATOR']:
                         # print(f"    Skipping neighbor {neighbor_node_id} (type: {neighbor_type}) - Same floor navigation, not already at stairs/elevator") # Debug
                         continue # Skip using stairs/elevator if goal is on the same floor and not already at one

            # Calculate cost to reach neighbor
            edge_data = campus_graph.get_edge_data(current_node_id, neighbor_node_id)
            distance = edge_data.get('weight', 1.0 if current_floor == neighbor_floor else INTER_FLOOR_EDGE_WEIGHT)

            tentative_g_score = g_score[current_node_id] + distance

            # Path improvement check
            if tentative_g_score < g_score[neighbor_node_id]:
                came_from[neighbor_node_id] = current_node_id
                g_score[neighbor_node_id] = tentative_g_score
                new_f_score = tentative_g_score + heuristic(neighbor_node_data, goal_node_data)
                f_score[neighbor_node_id] = new_f_score

                # Add neighbour to the open set
                # Using hash check helps avoid some redundant pushes but isn't strictly necessary
                if neighbor_node_id not in open_set_hash:
                     heapq.heappush(open_set, (new_f_score, neighbor_node_id))
                     open_set_hash.add(neighbor_node_id)
                else:
                     # Push anyway if already present; allows updating priority if better path found
                     heapq.heappush(open_set, (new_f_score, neighbor_node_id))

    # If no path found
    print("Open set is empty, goal was not reached. No path found!")
    return None