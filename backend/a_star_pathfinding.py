from heapq import heappop

import scipy
import numpy

"""
    A* pathfinding using f(n) = g(n) + h(n) evaluation function
    -----------------------------------------------------------
    f(n) = total estimated cost
    g(n) = cost of the path from the start node to the current node
    h(n) = heuristic estimate, cost of the cheapest path from the current node to the goal node 
    -----------------------------------------------------------
"""

def pathfinding_algo(initial_node, goal_node, map_graph):
    if initial_node not in map_graph.nodes or goal_node not in map_graph.nodes:
        print("Error: Initial or goal node not found in the graph.")
        return None

    open_set = [(0, initial_node)]
    came_from = {}
    g_score = {node: float('inf') for node in map_graph.nodes}
    g_score[initial_node] = 0
    f_score = {node: float('inf') for node in map_graph.nodes}