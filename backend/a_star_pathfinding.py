import heapq
import networkx as nx

def heuristic(node1_data, node2_data):
    """
    Calculate the heuristic distance (estimated cost) between two nodes.
    Uses Manhattan distance (dx + dy) to prioritize cardinal movement (up/down/left/right).

    :param node1_data: Dictionary of attributes for the first node.
    :param node2_data: Dictionary of attributes for the second node.
    :return: float: The estimated heuristic cost between the nodes. Returns infinity on error.
    """

    try:
        # Get coordinates, defaulting to 0.0 if missing
        x1 = node1_data.get('center_x', 0.0)
        y1 = node1_data.get('center_y', 0.0)
        x2 = node2_data.get('center_x', 0.0)
        y2 = node2_data.get('center_y', 0.0)

        # Calculate Manhattan distance
        dx = abs(x1 - x2)
        dy = abs(y1 - y2)
        manhattan_distance = dx + dy

        return manhattan_distance

    except (TypeError, AttributeError, KeyError) as e:
        # Log error if calculation fails due to missing/invalid data
        print(f"ERROR calculating heuristic: {e}. Node1: {node1_data.get('svg_id', 'N/A')}, Node2: {node2_data.get('svg_id', 'N/A')}")
        return float('inf') # Return infinity to avoid choosing problematic nodes

def reconstruct_path(came_from, current_node):
    """
    Reconstructs the path from the start node to the current_node
    by following the links in the came_from dictionary.

    :param came_from: Dictionary mapping each node to the node it came from.
    :param current_node: The goal node reached by the algorithm.
    :return: list: The reconstructed path from start to goal as a list of node IDs.
    """

    path = [current_node]
    # Trace back from the goal node to the start node
    while current_node in came_from:
        current_node = came_from[current_node]
        path.append(current_node)
    path.reverse() # Reverse the path to get start -> goal order
    return path

def find_node(room_id_input, campus_graph):
    """
    Finds the graph node ID corresponding to a given room ID/name input.
    Searches node attributes 'type', 'svg_id', and 'name' (case-insensitive).

    :param room_id_input: The room ID or name to search for.
    :param campus_graph: The graph representing the campus map. (NetworkX)
    :return: str or None: The unique node ID if found, otherwise None.
    """

    if not campus_graph or not room_id_input:
        print("Warning: find_node called with empty graph or room_id_input.")
        return None

    target_room_id_upper = room_id_input.strip().upper() # Normalize input for comparison

    # Iterate through all nodes and their data in the graph
    for node, data in campus_graph.nodes(data=True):
        # Check common attributes where the room ID might be stored
        if data.get('type', '').strip().upper() == target_room_id_upper:
            return node
        if data.get('svg_id', '').strip().upper() == target_room_id_upper:
            return node

    # If no match found after checking all nodes
    print(f"Warning: Node corresponding to '{room_id_input}' (normalized: '{target_room_id_upper}') not found in graph.")
    return None

def get_node_category(node_data):
    """
    Categorizes a node based on its 'type' attribute (typically the SVG ID).
    Used to determine allowed movements in the A* algorithm.

    :param node_data: Dictionary of attributes for the node.
    :return: str: The category of the node (e.g., 'walkable', 'obstacle', 'stairs...', 'elevator...', 'room', 'other', 'unknown').
    """

    # Get the 'type' attribute, convert to lowercase, default to empty string
    node_type = node_data.get('type', '').lower()
    if not node_type:
        return 'unknown' # Category for nodes with missing type

    # --- Specific Categories ---
    if node_type == 'walkable': return 'walkable'
    if node_type == 'obstacle': return 'obstacle'

    # Explicitly list all known stair and elevator types for clarity
    stair_types = [
        'stairsLIBRARY2', 'stairsLIBRARY1', 'stairsFRONT3', 'stairsFRONT2',
        'stairsFOOD', 'stairsJKCC8', 'stairsJKCC7', 'stairsJKCC6',
        'stairsJKCC5', 'stairsJKCC4', 'stairsJKCC3', 'stairsJKCC2',
        'stairsJKCC', 'stairsFRONT'
    ]
    elevator_types = [
        'elevatorJKCC3', 'elevatorJKCC2', 'elevatorJKCC', 'elevatorLIBRARY',
        'elevatorMAIN2', 'elevatorMAIN1'
    ]

    if node_type in stair_types: return node_type # Return specific stair type
    if node_type in elevator_types: return node_type # Return specific elevator type

    # --- General Room Check ---
    # Starts with a letter, contains a digit, and is not walkable/obstacle
    # Adjust this logic if room IDs have a different format
    if len(node_type) > 1 and node_type[0].isalpha() and any(c.isdigit() for c in node_type):
         if node_type not in ['walkable', 'obstacle']:
              return 'room'

    # Default category if none of the above match
    return 'other'

def pathfinding_algo(start_node_id, goal_node_id, campus_graph):
    """
    Finds the shortest path between two nodes in the campus graph using the A* algorithm.
    Costs are based on the 'weight' attribute of the graph edges.
    Uses Manhattan distance heuristic to prioritize cardinal movement.

    :param start_node_id: The unique ID of the starting node.
    :param goal_node_id: The unique ID of the goal node.
    :param campus_graph: The NetworkX graph representing the campus map.
    :return: list or None: A list of node IDs representing the path from start to goal,
                      or None if no path is found or an error occurs.
    """

    # --- Input Validation ---
    if start_node_id not in campus_graph:
        print(f"ERROR: Start node '{start_node_id}' not found in the graph.")
        return None
    if goal_node_id not in campus_graph:
        print(f"ERROR: Goal node '{goal_node_id}' not found in the graph.")
        return None
    if start_node_id == goal_node_id:
        print("Start and goal nodes are the same.")
        return [start_node_id] # Path is just a single node

    # Get data for start and goal nodes
    start_node_data = campus_graph.nodes[start_node_id]
    goal_node_data = campus_graph.nodes[goal_node_id]

    # Verify necessary attributes exist for heuristic calculation and logic
    required_attrs = ['floor', 'center_x', 'center_y', 'type']
    for attr in required_attrs:
        if attr not in start_node_data:
            print(f"ERROR: Start node '{start_node_id}' missing required attribute '{attr}'.")
            return None
        if attr not in goal_node_data:
            print(f"ERROR: Goal node '{goal_node_id}' missing required attribute '{attr}'.")
            return None

    # --- A* Initialization ---
    open_set = [] # Priority queue (min-heap) storing (f_score, node_id)
    start_h = heuristic(start_node_data, goal_node_data) # Initial heuristic cost (Manhattan)
    heapq.heappush(open_set, (start_h, start_node_id))

    came_from = {} # Dictionary to reconstruct the path: {node: predecessor}

    # g_score: Cost from start node to current node
    g_score = {node: float('inf') for node in campus_graph.nodes()}
    g_score[start_node_id] = 0

    # f_score: Estimated total cost from start to goal through current node (g_score + heuristic)
    f_score = {node: float('inf') for node in campus_graph.nodes()}
    f_score[start_node_id] = start_h

    open_set_hash = {start_node_id} # Set for quick checking if a node is in the open_set priority queue

    # Determine if navigation is between different floors
    start_floor = start_node_data.get('floor')
    goal_floor = goal_node_data.get('floor')
    is_cross_floor = (start_floor != goal_floor)
    print(f"Navigation is {'cross-floor' if is_cross_floor else 'same-floor'}")

    if is_cross_floor:
        start_category = get_node_category(start_node_data)
        goal_category = get_node_category(goal_node_data)
        print(f"DEBUG: Start Node '{start_node_id}' Category: {start_category}")
        print(f"DEBUG: Goal Node '{goal_node_id}' Category: {goal_category}")
        print(f"DEBUG: Start Node Neighbors: {list(campus_graph.neighbors(start_node_id))}")


    # Explicitly list all known stair and elevator types for use in rules
    stair_types = [
        'stairsLIBRARY2', 'stairsLIBRARY1', 'stairsFRONT3', 'stairsFRONT2',
        'stairsFOOD', 'stairsJKCC8', 'stairsJKCC7', 'stairsJKCC6',
        'stairsJKCC5', 'stairsJKCC4', 'stairsJKCC3', 'stairsJKCC2',
        'stairsJKCC', 'stairsFRONT'
    ]
    elevator_types = [
        'elevatorJKCC3', 'elevatorJKCC2', 'elevatorJKCC', 'elevatorLIBRARY',
        'elevatorMAIN2', 'elevatorMAIN1'
    ]
    vertical_transport_types = stair_types + elevator_types
    # Define categories allowed to precede/succeed vertical transport
    allowed_vertical_neighbors = ['walkable', 'room']

    # --- A* Main Loop ---
    node_counter = 0 # Counter to prevent potential infinite loops
    max_iterations = 40000 # Adjust this limit based on graph size and complexity --- probably too much atm anyway

    print(f"Starting A* from '{start_node_id}' to '{goal_node_id}'")

    while open_set:
        node_counter += 1
        if node_counter > max_iterations:
             print(f"ERROR: A* iteration limit exceeded ({max_iterations} nodes). Pathfinding aborted.")
             return None # Prevent excessive computation

        # Get the node with the lowest f_score from the priority queue
        current_f, current_node_id = heapq.heappop(open_set)
        open_set_hash.remove(current_node_id)

        #print(f"Node {node_counter}") # DEBUG

        # --- Goal Reached ---
        if current_node_id == goal_node_id:
            print(f"Goal '{goal_node_id}' reached after exploring {node_counter} nodes!")
            return reconstruct_path(came_from, current_node_id)

        # If we found a shorter path to this node already, skip processing this one
        if current_f > f_score[current_node_id]:
            continue

        # Get data for the current node being processed
        current_node_data = campus_graph.nodes[current_node_id]
        current_category = get_node_category(current_node_data)
        current_floor = current_node_data.get('floor')
        current_specific_type = current_node_data.get('type', 'N/A') # Get specific type for logging

        # Print current node being processed if debugging deeply
        #print(f"\nDEBUG: Processing Node: {current_node_id} (Category: {current_category}, Type: {current_specific_type}, Floor: {current_floor})")

        # --- Explore Neighbors ---
        for neighbor_node_id in campus_graph.neighbors(current_node_id):
            neighbor_node_data = campus_graph.nodes[neighbor_node_id]
            neighbor_category = get_node_category(neighbor_node_data)
            neighbor_floor = neighbor_node_data.get('floor')
            neighbor_specific_type = neighbor_node_data.get('type', 'N/A')  # Get specific type for logging

            # --- Cardinal Direction Check ---
            # Skip neighbors that are diagonal to the current node
            current_x = current_node_data.get('center_x')
            current_y = current_node_data.get('center_y')
            neighbor_x = neighbor_node_data.get('center_x')
            neighbor_y = neighbor_node_data.get('center_y')

            # Check if coordinates are valid
            if current_x is None or current_y is None or neighbor_x is None or neighbor_y is None:
                # This might happen for inter-floor nodes if coords aren't perfectly aligned,
                # but inter-floor movement is handled by specific rules later anyway.
                # For same-floor checks, coordinates should exist.
                if current_floor == neighbor_floor:
                    print(
                        f"Warning: Missing coordinates for cardinal direction check between same-floor nodes {current_node_id} and {neighbor_node_id}. Skipping neighbor.")
                    continue  # Skip same-floor neighbor if coordinates are missing

                # Allow potential cross-floor connection check to proceed even if coords missing/misaligned
                pass  # Let traversal rules handle cross-floor logic

            else:
                # Calculate differences only if coordinates are valid
                dx = abs(current_x - neighbor_x)
                dy = abs(current_y - neighbor_y)

                # Allow move ONLY if it's purely horizontal (dy is near zero) OR purely vertical (dx is near zero)
                # Use a small tolerance for floating point comparisons
                coord_tolerance = 1.5  # Small value to account for potential float inaccuracies -- Adjust as required
                is_horizontal = dy < coord_tolerance and dx > coord_tolerance
                is_vertical = dx < coord_tolerance and dy > coord_tolerance

                # This check primarily affects same-floor movement.
                # Inter-floor movement (stairs/elevators) relies on specific node types matching.
                if current_floor == neighbor_floor and not (is_horizontal or is_vertical):
                    # If it's neither purely horizontal nor purely vertical on the same floor, disallow
                    # print(f"    Skipping diagonal move: {current_node_id} ({current_x:.1f},{current_y:.1f}) to {neighbor_node_id} ({neighbor_x:.1f},{neighbor_y:.1f}) dx={dx:.2f}, dy={dy:.2f}")
                    continue  # Skip this neighbor as it's a diagonal move on the same floor
            # --- END Cardinal Direction Check ---

            # --- Traversal Rules ---
            allow_move = False

            # --- Rule 1: Cannot move into an Obstacle ---
            if neighbor_category == 'obstacle':
                continue  # Skip this neighbor entirely

            # CAN ADD MORE RULES HERE LATER IF NEEDED

            # --- Calculate Cost for Allowed Move ---
            edge_data = campus_graph.get_edge_data(current_node_id, neighbor_node_id, default={})
            # Base weight from edge (distance or specific stair/elevator weight)
            # Default to a high-cost if weight is somehow missing to discourage using the edge
            base_weight = edge_data.get('weight', float('inf'))
            if base_weight == float('inf'):
                print(f"Warning: Edge between {current_node_id} and {neighbor_node_id} has no 'weight' attribute. Assigning high cost.")

            move_distance = base_weight

            # --- Path Improvement Check ---
            # Calculate the cost to reach the neighbor through the current node
            tentative_g_score = g_score[current_node_id] + move_distance

            # If this path to the neighbor is shorter than any previously found path
            # Also check if move_distance is valid (not infinity)
            if tentative_g_score < g_score[neighbor_node_id] and move_distance != float('inf'):
                # Update path information
                came_from[neighbor_node_id] = current_node_id
                g_score[neighbor_node_id] = tentative_g_score
                # Calculate f_score (g_score + heuristic to goal)
                h_neighbor = heuristic(neighbor_node_data, goal_node_data)
                f_score[neighbor_node_id] = tentative_g_score + h_neighbor

                # Add neighbor to the open set (priority queue) if it's not already there
                if neighbor_node_id not in open_set_hash:
                    heapq.heappush(open_set, (f_score[neighbor_node_id], neighbor_node_id))
                    open_set_hash.add(neighbor_node_id)
                # If it is already in the open set, the heap property will handle the update
                # implicitly when this lower f_score is eventually processed.

    # If the loop finishes without reaching the goal
    print(f"Open set is empty after exploring {node_counter} nodes, goal was not reached. No path found!")
    return None
