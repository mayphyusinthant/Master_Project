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
    dx = node1_data.get('center_x', 0.0) - node2_data.get('center_x', 0.0)
    dy = node1_data.get('center_y', 0.0) - node2_data.get('center_y', 0.0)
    return math.sqrt(dx*dx + dy*dy)

def reconstruct_path(came_from, goal_node):
    """
    Reconstructing the path from came_from dictionary.
    :param came_from: Dictionary mapping nodes to the node they came from.
    :param goal_node: Goal node where the path ends.
    :return: list - A path from start to goal
    """
    path = [goal_node]
    while goal_node in came_from:
        goal_node = came_from[goal_node]
        path.append(goal_node)
    path.reverse() # Reverse to get the path from start to goal
    return path

def find_node(room_id, graph):
    """
    Find the unique node ID in the graph corresponding to a given room ID
    :param room_id: room ID (e.g. A17)
    :param graph: nx.Graph - NetworkX graph for the floor
    :return:  string - Unique node ID, otherwise None. Return the first match found.
    """
    for node, data in graph.nodes(data=True):
        if data.get('type') == room_id or data.get('svg_id') == room_id:
            return node
    return  None # If no node with that room_id is found

def pathfinding_algo(initial_node, goal_node, map_graph):
    """
    Find the shortest path between the nodes in a graph using A* algorithm
    :param initial_node: Unique ID of the starting node
    :param goal_node: Unique ID of the end node
    :param map_graph: NetworkX graph of the floor map
    :return: A list of node IDs representing the shortest path, or None if no path exists.
    """
    # Input validation
    if initial_node not in map_graph.nodes:
        print(f"Error: Start node '{initial_node}' not found in the graph.")
        return None
    if goal_node not in map_graph.nodes:
        print(f"Error: Goal node '{goal_node}' not found in the graph.")
        return None
    if initial_node == goal_node:
        return [initial_node] # The path is the starting node

    initial_node_data = map_graph.nodes[initial_node]
    goal_node_data = map_graph.nodes[goal_node]

    # Initialise A*
    # Use of priority queue to store tuples
    # Use of heapq for efficient retrieval of the node with the lowest f_score
    open_set = [(0 + heuristic(initial_node_data, goal_node_data), initial_node)]
    heapq.heapify(open_set)

    # Dictionary for path reconstruction
    came_from = {}

    # g_score - cost of the cheapest path from start to node found so far
    g_score = {node: float('inf') for node in map_graph.nodes}
    g_score[initial_node] = 0

    # f_score - estimated total cost from start to goal through node (g_score + heuristic)
    f_score = {node: float('inf') for node in map_graph.nodes}
    f_score[initial_node] = heuristic(initial_node_data, goal_node_data)

    # Keep the track of items currently in the priority queue
    open_set_hash = {initial_node}

    print(f"\nStarting A* from '{initial_node}' to '{goal_node}'...")

    # A* main loop
    while open_set:
        # Get the node in the open_set with the lowest f_score
        current_f, current_node_id = heapq.heappop(open_set)

        if current_f > f_score[current_node_id]:
            continue

        # Goal check
        if current_node_id == goal_node:
            print(" End goal reached!")
            return reconstruct_path(came_from, current_node_id)

        current_node_data = map_graph.nodes[current_node_id]

        # Exploring neighbours
        for neighbor_node_id in map_graph.neighbors(current_node_id):
            neighbor_node_data = map_graph.nodes[neighbor_node_id]

            # Calculate tentative g_score for the path through current node
            edge_data = map_graph.get_edge_data(current_node_id, neighbor_node_id)
            distance = edge_data.get('weight', 100.0) # 100 by default if weight missing

            tentative_g_score = g_score[current_node_id] + distance

            # Path improvement check
            if tentative_g_score <g_score[neighbor_node_id]:
                # Update path and score
                came_from[neighbor_node_id] = current_node_id
                g_score[neighbor_node_id] = tentative_g_score
                new_f_score = tentative_g_score + heuristic(neighbor_node_data, goal_node_data)
                f_score[neighbor_node_id] = new_f_score

                heapq.heappush(open_set, (new_f_score, neighbor_node_id))
                open_set_hash.add(neighbor_node_id)

    # If no path found
    print("Open set is empty, goal was not reached. No path found!")
    return None