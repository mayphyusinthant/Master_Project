import heapq
import networkx as nx
import math
import os


def heuristic(node1_data, node2_data):
    """
    Calculate the Euclidean distance heuristic between two nodes.
    :param node1_data: Attribute dictionary for the first node.
    :param node2_data: Attribute dictionary for the second node.
    :return: float - Euclidean distance.
    """
    # Use .get with default 0.0 for safety if attributes might be missing
    dx = node1_data.get('center_x', 0.0) - node2_data.get('center_x', 0.0)
    dy = node1_data.get('center_y', 0.0) - node2_data.get('center_y', 0.0)
    # Avoid sqrt of negative if coordinates are somehow invalid, though unlikely here
    dist_sq = dx*dx + dy*dy
    return math.sqrt(dist_sq) if dist_sq >= 0 else 0.0

def reconstruct_path(came_from, current_node):
    """
    Reconstructing the path from came_from dictionary.
    :param came_from: Dictionary mapping nodes to the node they came from.
    :param current_node: Goal node where the path ends.
    :return: list - A path from start to goal
    """
    path = [current_node]
    # Loop while the current node is in the came_from keys
    while current_node in came_from:
        current_node = came_from[current_node]
        path.append(current_node)
    path.reverse() # Reverse to get the path from start to goal
    return path

def find_node(room_id, graph):
    """
    Find the unique node ID in the graph corresponding to a given room ID
    :param room_id: room ID (e.g. A17)
    :param graph: nx.Graph - NetworkX graph for the floor
    :return:  string - Unique node ID, otherwise None. Return the first match found.
    """
    if not graph: # Handle case where graph might be None
        return None
    for node, data in graph.nodes(data=True):
        # Check both 'type' and 'svg_id' for flexibility
        # Make comparison case-insensitive for robustness
        node_type = data.get('type', '').upper()
        node_svg_id = data.get('svg_id', '').upper()
        target_room_id = room_id.upper()
        if node_type == target_room_id or node_svg_id == target_room_id:
            return node # Return the first node found matching the type/svg_id
    return None # If no node with that room_id is found

def is_room_node_type(node_type_str):
    """
    Helper function to determine if a node type string represents a specific room.
    Adjust this logic based on your actual room naming convention (e.g., 'A17', 'B.1.01').
    Current logic: Assumes Floor Letter (A-H) followed by at least one digit.
    """
    if not node_type_str or len(node_type_str) < 2:
        return False
    # Check if first char is a letter A-H and second is a digit
    return node_type_str[0].upper() in 'ABCDEFGH' and node_type_str[1].isdigit()


def pathfinding_algo(start_node_id, goal_node_id, map_graph):
    """
    Find the shortest path between the nodes in a graph using A* algorithm.
    Includes rules to avoid traversing through rooms or using stairs/elevators
    for same-floor navigation unless they are the goal.

    :param start_node_id: Unique ID of the starting node
    :param goal_node_id: Unique ID of the end node
    :param map_graph: NetworkX graph of the floor map
    :return: A list of node IDs representing the shortest path, or None if no path exists.
    """
    # Input validation
    if start_node_id not in map_graph.nodes:
        print(f"Error: Start node '{start_node_id}' not found in the graph.")
        return None
    if goal_node_id not in map_graph.nodes:
        print(f"Error: Goal node '{goal_node_id}' not found in the graph.")
        return None
    if start_node_id == goal_node_id:
        return [start_node_id] # The path is the starting node

    start_node_data = map_graph.nodes[start_node_id]
    goal_node_data = map_graph.nodes[goal_node_id]

    # Initialise A*
    open_set = [(heuristic(start_node_data, goal_node_data), start_node_id)] # f_score = g_score (0) + h
    heapq.heapify(open_set)
    came_from = {}
    g_score = {node: float('inf') for node in map_graph.nodes}
    g_score[start_node_id] = 0
    f_score = {node: float('inf') for node in map_graph.nodes}
    f_score[start_node_id] = heuristic(start_node_data, goal_node_data)
    open_set_hash = {start_node_id} # Keep track of nodes added to the heap

    # print(f"\nStarting A* from '{start_node_id}' to '{goal_node_id}'...") # Optional debug

    # A* main loop
    while open_set:
        # Get the node in the open_set with the lowest f_score
        current_f, current_node_id = heapq.heappop(open_set)

        # Optimization: If we already found a better path to this node, skip
        if current_f > f_score[current_node_id]:
             continue

        # Goal check
        if current_node_id == goal_node_id:
            # print(" End goal reached!") # Optional debug
            return reconstruct_path(came_from, current_node_id)

        current_node_data = map_graph.nodes[current_node_id]

        # Exploring neighbours
        for neighbor_node_id in map_graph.neighbors(current_node_id):
            neighbor_node_data = map_graph.nodes[neighbor_node_id]

            # --- *** ADDED TRAVERSAL RULES *** ---
            # Check rules only if the neighbor is NOT the final destination
            if neighbor_node_id != goal_node_id:
                neighbor_type = neighbor_node_data.get('type', '').upper() # Use upper for case-insensitivity

                # Rule 1: Skip if neighbor is a specific room node
                if is_room_node_type(neighbor_type):
                    # print(f"    Skipping neighbor {neighbor_node_id} (type: {neighbor_type}) - Is Room Node") # Debug
                    continue # Skip this neighbor as an intermediate step

                # Rule 2: Skip stairs/elevators for same-floor navigation
                # (Expand this list if you have other similar types)
                if neighbor_type in ['STAIRS', 'ELEVATOR']:
                    # print(f"    Skipping neighbor {neighbor_node_id} (type: {neighbor_type}) - Is Stair/Elevator") # Debug
                    continue # Skip this neighbor as an intermediate step
            # --- *** END OF TRAVERSAL RULES *** ---


            # Calculate tentative g_score for the path through current node
            edge_data = map_graph.get_edge_data(current_node_id, neighbor_node_id)
            # Use a default weight if 'weight' attribute is missing, but 1.0 is often better than 100.0
            distance = edge_data.get('weight', 1.0) # Default weight 1.0

            tentative_g_score = g_score[current_node_id] + distance

            # Path improvement check
            if tentative_g_score < g_score[neighbor_node_id]:
                # Update path and score
                came_from[neighbor_node_id] = current_node_id
                g_score[neighbor_node_id] = tentative_g_score
                new_f_score = tentative_g_score + heuristic(neighbor_node_data, goal_node_data)
                f_score[neighbor_node_id] = new_f_score # Update f_score map

                # Add neighbour to the open set
                # Check hash *before* pushing to potentially avoid duplicates in heap if already present
                # Although heapq handles duplicates, this can be slightly more efficient
                if neighbor_node_id not in open_set_hash:
                     heapq.heappush(open_set, (new_f_score, neighbor_node_id))
                     open_set_hash.add(neighbor_node_id) # Track that it's conceptually in the queue
                else:
                     # If already in queue, push anyway; heapq will manage priorities.
                     # Alternative (more complex): update priority if found path is better.
                     heapq.heappush(open_set, (new_f_score, neighbor_node_id))


    # If no path found
    # print("Open set is empty, goal was not reached. No path found!") # Optional debug
    return None