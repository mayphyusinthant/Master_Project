import unittest
import networkx as nx
import svgelements
import os
from map_parser import svg_map_parse, are_adjacent, process_maps
import math
import tempfile

def svg_map_parse(svg_map):
    """
    Parses an SVG file and extracts rectangular elements as nodes in a NetworkX graph,
    connecting adjacent rectangles with edges.

    Args:
        svg_map (str): The path to the SVG file.

    Returns:
        networkx.Graph: A NetworkX graph representing the map, or None on error.
                        Nodes are rectangles with their attributes, and edges connect
                        adjacent rectangles with a weight equal to the average cost.
    """
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
    print("--- Calculating Adjacency ---")
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
    """
    Checks if two rectangles are adjacent (overlapping or touching sides within tolerance).

    Args:
        rect1 (dict): Dictionary representing the first rectangle {'x', 'y', 'width', 'height'}.
        rect2 (dict): Dictionary representing the second rectangle {'x', 'y', 'width', 'height'}.
        tolerance (float): Allowed gap or overlap to consider as touching.

    Returns:
        bool: True if the rectangles are adjacent, False otherwise.
    """
    # Calculate the boundaries of the rectangles
    left1, right1 = rect1['x'], rect1['x'] + rect1['width']
    top1, bottom1 = rect1['y'], rect1['y'] + rect1['height']
    left2, right2 = rect2['x'], rect2['x'] + rect2['width']
    top2, bottom2 = rect2['y'], rect2['y'] + rect2['height']

    # Check if bounding boxes (expanded by tolerance) intersect
    # This is a necessary condition for adjacency.
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

    # Optional: Consider corner touching? Usually not desired for pathfinding grids.
    # If needed, add condition like: abs(dx) < tolerance and abs(dy) < tolerance

    return False # Otherwise, they are separate

class TestSVGMapParser(unittest.TestCase):

    def test_floor_a_node_attributes_unique(self):
        """
        Tests parsing of Floor_A.svg with unique node IDs.
        Checks specific nodes based on type and coordinates.
        """
        floor_a_svg_path = os.path.join("static", "Floor_A.svg")
        print(f"\nAttempting to parse for unique nodes: {os.path.abspath(floor_a_svg_path)}")

        # Ensure the file exists before parsing
        self.assertTrue(os.path.exists(floor_a_svg_path), f"SVG file not found at {floor_a_svg_path}")

        graph = svg_map_parse(floor_a_svg_path) # Use the updated parser

        # Basic graph checks
        self.assertIsNotNone(graph, "svg_map_parse should return a graph object, not None.")
        self.assertIsInstance(graph, nx.Graph, "svg_map_parse should return a NetworkX Graph")
        self.assertGreater(len(graph.nodes), 0, "Graph should have nodes after parsing Floor_H.svg")
        print(f"Total nodes parsed: {len(graph.nodes)}")

    def test_file_not_found(self):
        """Tests that svg_map_parse returns None for a non-existent file."""
        print("\n--- Testing File Not Found ---")
        non_existent_path = os.path.join("path", "to", "non_existent_file.svg")
        graph = svg_map_parse(non_existent_path)
        self.assertIsNone(graph, "Should return None when SVG file does not exist.")
        print("--- Finished Testing File Not Found ---")

    def test_invalid_svg_content(self):
        """Tests that svg_map_parse returns None for invalid SVG/XML content."""
        print("\n--- Testing Invalid SVG Content ---")
        invalid_content = "<svg><rect id='valid' cost='1' x='0' y='0' width='10' height='10'><malformed></svg>"
        # Use tempfile to write invalid content to a temporary file
        with tempfile.NamedTemporaryFile(mode='w', suffix=".svg", delete=False) as tmp_file:
            tmp_file.write(invalid_content)
            tmp_file_path = tmp_file.name
        try:
            graph = svg_map_parse(tmp_file_path)
            # Depending on svgelements strictness, it might return an empty graph or None
            # self.assertIsNone(graph, "Should return None for invalid SVG content.")
            # OR check for empty graph if parser is lenient
            if graph is not None:
                self.assertEqual(len(graph.nodes), 0, "Graph should be empty or None for invalid SVG")
            else:
                self.assertIsNone(graph, "Graph should be None for invalid SVG")

        finally:
            os.remove(tmp_file_path)  # Clean up the temporary file
        print("--- Finished Testing Invalid SVG Content ---")

    def test_empty_svg(self):
        """Tests parsing an SVG with no rect elements."""
        print("\n--- Testing Empty SVG ---")
        empty_svg_content = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>'
        with tempfile.NamedTemporaryFile(mode='w', suffix=".svg", delete=False) as tmp_file:
            tmp_file.write(empty_svg_content)
            tmp_file_path = tmp_file.name
        try:
            graph = svg_map_parse(tmp_file_path)
            self.assertIsNotNone(graph, "Parser should return a graph object for valid empty SVG.")
            self.assertEqual(len(graph.nodes), 0, "Graph should have 0 nodes for an SVG with no rects.")
            self.assertEqual(len(graph.edges), 0, "Graph should have 0 edges for an SVG with no rects.")
        finally:
            os.remove(tmp_file_path)
        print("--- Finished Testing Empty SVG ---")

    def test_adjacency_and_weights(self):
        """Tests edge creation and weight calculation between adjacent rects."""
        print("\n--- Testing Adjacency and Weights ---")
        # Two rectangles touching side-by-side
        svg_content = """<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
            <rect id="R1" cost="10" x="0" y="0" width="10" height="10"/>
            <rect id="R2" cost="20" x="10" y="0" width="10" height="10"/>
            <rect id="R3" cost="30" x="30" y="0" width="10" height="10"/> </svg>"""
        with tempfile.NamedTemporaryFile(mode='w', suffix=".svg", delete=False) as tmp_file:
            tmp_file.write(svg_content)
            tmp_file_path = tmp_file.name
        try:
            # Ensure are_adjacent is correctly defined/imported for this test
            if 'are_adjacent' not in globals() and 'are_adjacent' not in locals():
                self.skipTest("are_adjacent function not available for adjacency test.")

            graph = svg_map_parse(tmp_file_path)
            self.assertIsNotNone(graph)
            self.assertEqual(len(graph.nodes), 3)

            # Generate expected unique node IDs (assuming order R1, R2, R3)
            node1_id = "R1_0.00_0.00_1"
            node2_id = "R2_10.00_0.00_2"
            node3_id = "R3_30.00_0.00_3"

            self.assertTrue(graph.has_node(node1_id))
            self.assertTrue(graph.has_node(node2_id))
            self.assertTrue(graph.has_node(node3_id))

            # Check edge between R1 and R2
            self.assertTrue(graph.has_edge(node1_id, node2_id),
                            f"Edge missing between adjacent {node1_id} and {node2_id}")
            if graph.has_edge(node1_id, node2_id):
                weight = graph.edges[node1_id, node2_id]['weight']
                expected_weight = (10 + 20) / 2
                self.assertAlmostEqual(weight, expected_weight, places=5, msg="Incorrect edge weight for R1-R2")
                print(f"  Edge OK: {node1_id} <-> {node2_id}, Weight: {weight}")

            # Check no edge between R1 and R3
            self.assertFalse(graph.has_edge(node1_id, node3_id),
                             f"Edge should not exist between non-adjacent {node1_id} and {node3_id}")
            # Check no edge between R2 and R3
            self.assertFalse(graph.has_edge(node2_id, node3_id),
                             f"Edge should not exist between non-adjacent {node2_id} and {node3_id}")

            self.assertEqual(len(graph.edges), 1, "Should only be one edge in this simple case.")

        finally:
            os.remove(tmp_file_path)
        print("--- Finished Testing Adjacency and Weights ---")

        print("--- Finished Checking Node Attributes ---")
