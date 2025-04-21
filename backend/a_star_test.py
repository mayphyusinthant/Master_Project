import unittest
import networkx as nx
from a_star_pathfinding import pathfinding_algo, reconstruct_path, heuristic, find_node

class MyTestCase(unittest.TestCase):
    def setUp(self):
        """ Dummy data"""
        self.grid_graph = nx.Graph()
        node_data = {
            'A': {'center_x': 0, 'center_y': 0, 'type': 'A'}, 'B': {'center_x': 1, 'center_y': 0, 'type': 'B'}, 'C': {'center_x': 2, 'center_y': 0, 'type': 'C'},
            'D': {'center_x': 0, 'center_y': 1, 'type': 'D'}, 'E': {'center_x': 1, 'center_y': 1, 'type': 'E'}, 'F': {'center_x': 2, 'center_y': 1, 'type': 'F'},
            'G': {'center_x': 0, 'center_y': 2, 'type': 'G'}, 'H': {'center_x': 1, 'center_y': 2, 'type': 'H'}, 'I': {'center_x': 2, 'center_y': 2, 'type': 'I'},
        }
        for node, data in node_data.items():
            self.grid_graph.add_node(node, **data)
        edges = [
            ('A', 'B', 1), ('B', 'C', 1), ('A', 'D', 1), ('B', 'E', 1), ('C', 'F', 1),
            ('D', 'E', 1), ('E', 'F', 1), ('D', 'G', 1), ('E', 'H', 1), ('F', 'I', 1),
            ('G', 'H', 1), ('H', 'I', 1)
        ]
        for u, v, w in edges:
            self.grid_graph.add_edge(u, v, weight=w)

    """ TEST #1 """
    def test_simple_path(self):
        """ Test finding a straightforward path in the grid graph."""
        print("\n--- Testing Simple Path ---")
        path = pathfinding_algo('A', 'I', self.grid_graph)
        self.assertIsNotNone(path)
        self.assertEqual(len(path), 5)
        self.assertEqual(path[0], 'A'); self.assertEqual(path[-1], 'I')
        expected_paths = [
            ['A', 'B', 'E', 'F', 'I'], ['A', 'D', 'E', 'F', 'I'],
            ['A', 'B', 'E', 'H', 'I'], ['A', 'D', 'E', 'H', 'I']
        ]
        self.assertIn(path, expected_paths, f"Found path {path} not among expected shortest paths.")
        print(f"  Found path: {' -> '.join(path)}")

    """ TEST #2 """
    def test_no_path(self):
        """ Testing where no path exists between start and goal."""
        print("\n--- Testing No Path ---")
        self.grid_graph.add_node('Z', center_x=10, center_y=10, type='Z')
        path = pathfinding_algo('A', 'Z', self.grid_graph)
        self.assertIsNone(path, "Should return None when no path exists.")
        print("  No path found (as expected).")

    """ TEST #3 """
    def test_start_equals_goal(self):
        """ Test initial node == goal node."""
        print("\n--- Testing Start == Goal ---")
        path = pathfinding_algo('E', 'E', self.grid_graph)
        self.assertIsNotNone(path)
        self.assertEqual(path, ['E'], "Path should be just the node itself if start==goal.")
        print(f"  Found path: {' -> '.join(path)}")

    """ TEST #4 """
    def test_obstacle_path(self):
        """ Find a path around a high-cost 'obstacle' edge."""
        print("\n--- Testing Obstacle Path ---")
        original_weight = self.grid_graph.edges['B', 'E']['weight'] # Store original
        self.grid_graph.edges['B', 'E']['weight'] = 1000
        path = pathfinding_algo('A', 'I', self.grid_graph)
        self.assertIsNotNone(path)
        self.assertEqual(len(path), 5)
        expected_paths = [
            ['A', 'D', 'E', 'F', 'I'], ['A', 'D', 'E', 'H', 'I'],
            ['A', 'D', 'G', 'H', 'I'], ['A', 'B', 'C', 'F', 'I'],
        ]
        # Check path doesn't use B-E edge
        path_edges = list(zip(path[:-1], path[1:]))
        self.assertNotIn(('B', 'E'), path_edges)
        self.assertNotIn(('E', 'B'), path_edges)
        # Check it's one of the valid alternatives
        self.assertIn(path, expected_paths, f"Found path {path} not among expected paths around obstacle.")
        print(f"  Found path around obstacle: {' -> '.join(path)}")
        self.grid_graph.edges['B', 'E']['weight'] = original_weight # Restore original weight

    """ TEST #5 """
    def test_invalid_nodes(self):
        """ Test with start or goal node IDs not in the graph."""
        print("\n--- Testing Invalid Nodes ---")
        path_invalid_start = pathfinding_algo('X', 'I', self.grid_graph)
        self.assertIsNone(path_invalid_start, "Should return None for invalid start node.")
        path_invalid_goal = pathfinding_algo('A', 'Y', self.grid_graph)
        self.assertIsNone(path_invalid_goal, "Should return None for invalid goal node.")
        print("  Returned None for invalid nodes (as expected).")

    """ TEST #6 """
    def test_heuristic_calculation(self):
        """ Testing heuristic function calculation."""
        print("\n--- Testing Heuristic ---")
        node1_data = {'center_x': 0, 'center_y': 0}
        node2_data = {'center_x': 3, 'center_y': 4}
        expected_h = 5.0
        actual_h = heuristic(node1_data, node2_data)
        self.assertAlmostEqual(actual_h, expected_h, places=5)
        print(f"  Heuristic calculated correctly ({actual_h:.2f}).")

    """ TEST #7 """
    def test_reconstruct_path(self):
        """ Path reconstruction."""
        print("\n--- Testing Path Reconstruction ---")
        came_from = {'B': 'A', 'C': 'B', 'D': 'C'}
        goal = 'D'
        expected_path = ['A', 'B', 'C', 'D']
        actual_path = reconstruct_path(came_from, goal)
        self.assertEqual(actual_path, expected_path)
        print(f"  Path reconstructed correctly: {' -> '.join(actual_path)}")

    """ TEST #8 """
    def test_find_node(self):
        """Test finding nodes by their 'type' attribute."""
        print("\n--- Testing Find Node by Room ID ---")
        # Call the renamed function 'find_node'
        found_node_id = find_node('E', self.grid_graph)
        self.assertEqual(found_node_id, 'E')

        # Test with a type that doesn't exist
        found_node_id_none = find_node('NonExistent', self.grid_graph)
        self.assertIsNone(found_node_id_none)

        # Test with potentially duplicate types (add a node)
        self.grid_graph.add_node('E2', center_x=5, center_y=5, type='E')
        # find_node should return the *first* one found ('E')
        found_node_id_first = find_node('E', self.grid_graph)
        self.assertEqual(found_node_id_first, 'E')
        print("  Find node by room ID works correctly.")



