from flask import Flask, render_template, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from datetime import datetime
import os
import networkx as nx
import traceback

# Import map parsing and A* functions
try:
    from map_parser import create_campus_graph
    from a_star_pathfinding import find_node, pathfinding_algo
    from navigation_utils import create_navigation

    # Enable navigation functionality
    FUNCTIONS_LOADED = True
    #print("Successfully imported map parsing, A*, and navigation_utils functions.")
except ImportError as e:
    print(f"ERROR: Failed to import required modules: {e}")
    print("Navigation functionality will be disabled.")
    FUNCTIONS_LOADED = False

    # Define dummy functions if import fails, so app can still run (partially)
    def create_campus_graph(directory="static", **kwargs): print("Dummy create_campus_graph called."); return None
    def find_node(room_id, graph): print("Dummy find_node called."); return None
    def pathfinding_algo(start, goal, graph): print("Dummy pathfinding_algo called."); return None
    def create_navigation(f_room, t_room): print("Dummy create_navigation called."); return "Navigation unavailable."

# Global variable to store the combined campus graph
CAMPUS_GRAPH = None

def initialize_graphs():
    """ Parse all SVG maps and create a combined campus graph on startup """
    global CAMPUS_GRAPH
    if not FUNCTIONS_LOADED:
        print("Skipping graph initialization due to import errors.")
        CAMPUS_GRAPH = None
        return

    print("Initializing combined campus graph...")
    try:
        # Directory containing SVG files
        base_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in locals() else '.'
        map_directory = os.path.join(base_dir, "static")
        print(f"Looking for maps in: {map_directory}")

        CAMPUS_GRAPH = create_campus_graph(directory=map_directory)

        if CAMPUS_GRAPH is None or not isinstance(CAMPUS_GRAPH, nx.Graph):
             print(f"ERROR: create_campus_graph failed to return a valid graph from '{map_directory}'.")
             CAMPUS_GRAPH = None
        elif len(CAMPUS_GRAPH.nodes) == 0:
             print(f"Warning: Combined campus graph has 0 nodes. Check parsing.")
        else:
             print(f"Combined campus graph created successfully.")
             print(f"Total Nodes: {CAMPUS_GRAPH.number_of_nodes()}, Total Edges: {CAMPUS_GRAPH.number_of_edges()}")
    except Exception as e:
        print(f"ERROR during graph initialization: {e}")
        traceback.print_exc() # Print detailed traceback for debugging
        CAMPUS_GRAPH = None

app = Flask(__name__)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# MySQL Configuration
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'campus_database'

mysql = MySQL(app)

@app.route("/")
def index():
    cur = mysql.connection.cursor()
    cur.execute("SELECT DISTINCT floor FROM room_info ORDER BY floor ASC")
    floors = [row[0] for row in cur.fetchall()]
    cur.close()

    return render_template("index.html", floors=floors)

@app.route("/campus_info")
def campus_mgmt():
    per_page = 25  
    page = request.args.get('page', 1, type=int)  
    offset = (page - 1) * per_page  

    cur = mysql.connection.cursor()
    cur.execute("SELECT COUNT(*) FROM room_info")
    total_rows = cur.fetchone()[0]
    cur.execute("SELECT room_id, room_name, description, floor FROM room_info LIMIT %s OFFSET %s", (per_page, offset))
    rooms = cur.fetchall()
    
    cur.close()

    total_pages = (total_rows // per_page) + (1 if total_rows % per_page > 0 else 0)  
    return render_template('campus_info.html', rooms=rooms, page=page, total_pages=total_pages)

@app.route('/users')
def users():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM users")
    data = cur.fetchall()
    cur.close()
    return str(data)

# api routes for react (need to be imported from file after)
# @app.route('/api/rooms', methods=['GET'])
# def get_rooms():
#     room_type = request.args.get('roomType')

#     if not room_type:
#         room_type = "All"

#     cur = mysql.connection.cursor()
#     query = """
#             SELECT * FROM room_info  
#             JOIN class_schedule_info ON room_info.room_id = class_schedule_info.room_id
#             """
          
#     cur.execute(query)
#     rows = cur.fetchall()
#     cur.close()

#     rooms = []
#     for row in rows:
#          rooms.append({
#             "roomId": row[0],  
#             "roomName": row[1],
#             "type": row[2],
#             "description": row[3],
#             "floor": row[4]
#         })

#     return jsonify(rooms)
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    room_type = request.args.get('roomType')
    if not room_type:
        room_type = "All"

    # Get current datetime
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    cur = mysql.connection.cursor()

    # Query: Get all rooms, and check if they are booked right now
    query = """
        SELECT r.room_id, r.room_name, r.room_type, r.description, r.floor, cs.title, cs.start_date_time, cs.end_date_time
        FROM room_info r
        LEFT JOIN class_schedule_info cs 
            ON r.room_id = cs.room_id 
            AND %s BETWEEN cs.start_date_time AND cs.end_date_time
    """

    cur.execute(query, (now,))
    rows = cur.fetchall()
    cur.close()

    rooms = []
    for row in rows:
        rooms.append({
            "roomId": row[0],
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4],
            "scheduleTitle": row[5],
            "startDateTime": row[6],
            "endDateTime": row[7]
        })

    return jsonify(rooms)

@app.route('/api/navigate', methods=['POST'])
def handle_navigation():
    """ Handles navigation requests, performs A* search, and returns segmented path. """
    print(f"\n--- Received Navigation Request ---")
    response = None

    try:
        if not FUNCTIONS_LOADED:
             print("Error: Core navigation functions failed to load on startup.")
             return jsonify({"status": "error", "message": "Navigation system core functions are unavailable."}), 503
        if CAMPUS_GRAPH is None or not isinstance(CAMPUS_GRAPH, nx.Graph) or CAMPUS_GRAPH.number_of_nodes() == 0:
             print("Error: Campus graph is not initialized or is empty.")
             return jsonify({"status": "error", "message": "Navigation map data is not available or incomplete."}), 503

        data = request.get_json()
        if not data:
            print("Error: Invalid request - Missing JSON body.")
            return jsonify({"status": "error", "message": "Invalid request body (missing JSON)."}), 400

        start_room_input = data.get('from')
        goal_room_input = data.get('to')

        if not start_room_input or not goal_room_input:
            print(f"Error: Missing 'from' [{start_room_input}] or 'to' [{goal_room_input}] in request.")
            return jsonify({"status": "error", "message": "Missing 'from' or 'to' room name in request."}), 400

        print(f"Attempting navigation From: '{start_room_input}' To: '{goal_room_input}'")

        # Find Nodes in Graph
        start_node_id = find_node(start_room_input, CAMPUS_GRAPH)
        goal_node_id = find_node(goal_room_input, CAMPUS_GRAPH)

        # Validate if nodes were found
        if start_node_id is None:
            msg = f"Start location '{start_room_input}' not found as a navigable node in the graph."
            print(f"Error: {msg}")
            return jsonify({"status": "error", "message": msg}), 404
        if goal_node_id is None:
            msg = f"Goal location '{goal_room_input}' not found as a navigable node in the graph."
            print(f"Error: {msg}")
            return jsonify({"status": "error", "message": msg}), 404

        print(f"Graph nodes identified: Start='{start_node_id}', Goal='{goal_node_id}'")

        # --- Run A* Pathfinding ---
        path_node_ids = None
        print("Running A* pathfinding algorithm...")
        path_node_ids = pathfinding_algo(start_node_id, goal_node_id, CAMPUS_GRAPH)

        # Process Path or Handle No Path
        if path_node_ids:
            print(f"A* Path found with {len(path_node_ids)} nodes. Starting segmentation...")
            # Segmentation Logic
            try:
                path_segments = [] # Empty list to store path segments

                # Handle the edge case where the path contains only one node (start is the same as goal)
                if len(path_node_ids) == 1:
                     node_id = path_node_ids[0]
                     # Ensure the node exists in the graph before accessing its data
                     if node_id not in CAMPUS_GRAPH.nodes: raise KeyError(f"Node '{node_id}' not found")
                     node_data = CAMPUS_GRAPH.nodes[node_id]
                     # Create a single segment containing just the start/goal node
                     path_segments.append({
                        "floor": node_data.get('floor', 'Unknown'),
                        "coords": [[node_data.get('center_x', 0.0), node_data.get('center_y', 0.0)]],
                        "node_ids": [node_id], "end_node_type": node_data.get('type', 'Unknown'), "end_node_id": node_id
                     })
                # Handle paths with multiple nodes
                else:
                    # Get data for the very first node in the path
                    first_node_id = path_node_ids[0]
                    if first_node_id not in CAMPUS_GRAPH.nodes: raise KeyError(f"Node '{first_node_id}' not found")
                    first_node_data = CAMPUS_GRAPH.nodes[first_node_id]
                    # Determine the starting floor and coordinates
                    start_floor = first_node_data.get('floor', 'Unknown')
                    start_coords = [first_node_data.get('center_x', 0.0), first_node_data.get('center_y', 0.0)]

                    # Initialize the first segment dictionary with the starting node's data
                    # 'end_node_type' and 'end_node_id' will be filled when the segment ends
                    current_segment = {
                        "floor": start_floor, "coords": [start_coords], "node_ids": [first_node_id],
                        "end_node_type": None, "end_node_id": None
                    }
                    # Keep track of the floor of the previous node to detect changes
                    last_floor = start_floor

                    # Iterate through the path nodes, starting from the second node (index 1)
                    for i in range(1, len(path_node_ids)):
                        node_id = path_node_ids[i]
                        # Ensure the current node exists in the graph
                        if node_id not in CAMPUS_GRAPH.nodes: raise KeyError(f"Node '{node_id}' not found")
                        node_data = CAMPUS_GRAPH.nodes[node_id]
                        # Get the floor and coordinates of the current node
                        current_floor = node_data.get('floor', last_floor)
                        coords = [node_data.get('center_x', 0.0), node_data.get('center_y', 0.0)]

                        # --- Core Segmentation Logic: Check if the floor has changed ---
                        if current_floor != last_floor:
                            # Floor has changed, so the previous segment is complete
                            if current_segment["coords"]: # Make sure the segment isn't empty
                                # The node *before* the current one (i-1) is the last node of the previous segment
                                # This node represents the transition point (e.g., stairs/elevator)
                                last_node_id_in_segment = path_node_ids[i - 1]
                                if last_node_id_in_segment not in CAMPUS_GRAPH.nodes: raise KeyError(f"Node '{last_node_id_in_segment}' not found")
                                last_node_data_in_segment = CAMPUS_GRAPH.nodes[last_node_id_in_segment]
                                transition_node_type = last_node_data_in_segment.get('type', 'Unknown')

                                # Store the transition node's type and ID in the completed segment
                                current_segment["end_node_type"] = transition_node_type
                                current_segment["end_node_id"] = last_node_id_in_segment

                                # Add the completed segment to the list of segments
                                path_segments.append(current_segment)

                            # Start a new segment for the new floor, beginning with the current node
                            current_segment = {
                                "floor": current_floor, "coords": [coords], "node_ids": [node_id],
                                "end_node_type": None, "end_node_id": None
                            }
                        else:
                            # Floor has not changed, add the current node's data to the ongoing segment
                            current_segment["coords"].append(coords)
                            current_segment["node_ids"].append(node_id)

                        # Update last_floor for the next iteration
                        last_floor = current_floor

                    # After the loop finishes, the 'current_segment' holds the last segment of the path
                    if current_segment["coords"]:
                        # The very last node in the original path list is the end of this final segment
                        last_node_id_in_path = path_node_ids[-1]
                        if last_node_id_in_path not in CAMPUS_GRAPH.nodes: raise KeyError(f"Node '{last_node_id_in_path}' not found")
                        last_node_data_in_path = CAMPUS_GRAPH.nodes[last_node_id_in_path]
                        # Get the type of the final destination node
                        final_node_type = last_node_data_in_path.get('type', 'Unknown')
                        # Set the end node details for the final segment
                        current_segment["end_node_type"] = final_node_type
                        current_segment["end_node_id"] = last_node_id_in_path

                        # Add the final segment to the list
                        path_segments.append(current_segment)
                # End Segmentation

                print(f"Path successfully segmented into {len(path_segments)} segments.")
                nav_message = f"Please follow the path from {start_room_input} to {goal_room_input}."
                response = jsonify({
                    "status": "success", "message": nav_message, "path_segments": path_segments
                }), 200

            except KeyError as e:
                print(f"CRITICAL ERROR during path segmentation: KeyError - Node {e} not found in graph or missing attribute.")
                traceback.print_exc()
                response = jsonify({"status": "error", "message": f"Error processing path data: A required location ({e}) was not found in the map data."}), 500
            except Exception as e:
                print(f"CRITICAL ERROR during path segmentation: {e}")
                traceback.print_exc()
                response = jsonify({"status": "error", "message": "An internal server error occurred while processing the navigation path."}), 500

        else: # path_node_ids is None or empty (No path found)
            print("No path found between start and goal nodes (A* returned None or empty list).")
            if start_node_id == goal_node_id:
                 msg = f"You are already at '{start_room_input}'."
                 response = jsonify({"status": "success", "message": msg, "path_segments": []}), 200
            else:
                msg = f"Sorry, no navigable path could be found between '{start_room_input}' and '{goal_room_input}'. The locations might be disconnected on the map."
                response = jsonify({"status": "error","message": msg,"path_segments": []}), 404

    except Exception as e:
        print(f"CRITICAL UNHANDLED ERROR in handle_navigation: {e}")
        traceback.print_exc()
        response = jsonify({"status": "error", "message": "An unexpected internal server error occurred."}), 500

    # Final Return
    # Ensure response is not None before returning
    if response is None:
        print("!!! LOGIC ERROR: handle_navigation reached end without setting a response !!!")
        response = jsonify({"status": "error", "message": "Internal server error: Failed to generate response."}), 500

    return response

@app.route('/api/library_room_types', methods=['GET'])
def get_library_room_types():
    cur = mysql.connection.cursor()
    cur.execute("""SELECT DISTINCT room_type FROM `room_info` 
                WHERE room_type != 'Lecture Room'
                AND room_type != 'Stairs'
                AND room_type != 'Toilet'
                AND room_type != 'Elevator'
                """)
    
    rows = cur.fetchall()
    cur.close()

    # Prepare the library_rooms_type
    library_rooms_type = []
    library_rooms_type.append({"type": "All"})

    for row in rows:
        library_rooms_type.append({
            "type": row[0],
        })

    # Debug print to console
    print("Returning data:", library_rooms_type)
    
    # Make sure we're returning a properly formatted JSON array
    return jsonify(library_rooms_type)


@app.route('/api/available_library_rooms', methods=['GET'])
def get_available_library_rooms():

    start_dt = datetime.strptime(request.args.get('start_date_time'), "%Y-%m-%d %H:%M:%S")
    end_dt = datetime.strptime(request.args.get('end_date_time'), "%Y-%m-%d %H:%M:%S")
    room_type = request.args.get('roomType')

    # Validate input
    if not start_dt or not end_dt:
        return jsonify({"error": "start_date_time and end_date_time are required"}), 400

    if not room_type:
        room_type = "All"

    start_dt_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
    end_dt_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')
        
    cur = mysql.connection.cursor()
    if room_type == "All" or room_type == "":
        query = """
            SELECT * FROM room_info 
            WHERE room_id NOT IN (
                SELECT room_id 
                FROM rooms_booking_info 
                WHERE 
                    (start_date_time >= %s AND start_date_time <= %s)  
                    OR 
                    (end_date_time >= %s AND end_date_time <= %s)
            ) 
            AND (room_name LIKE %s OR room_type LIKE %s)
            AND room_info.room_name NOT LIKE %s
        """
        
        params = (start_dt_str, end_dt_str, start_dt_str, end_dt_str, 'L%', 'SCEBE %', 'Library')
        cur.execute(query, params)
   
    else:
        query = """
            SELECT * FROM room_info 
            WHERE room_id NOT IN (
                SELECT room_id 
                FROM rooms_booking_info 
                WHERE 
                    (start_date_time >= %s AND start_date_time <= %s)  
                    OR 
                    (end_date_time >= %s AND end_date_time <= %s)
            ) 
            AND room_type = %s
            AND room_info.room_name NOT LIKE %s

        """
        
        params = (start_dt_str, end_dt_str, start_dt_str, end_dt_str, room_type, 'Library')
        cur.execute(query, params)

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    available_library_rooms = []
    for row in rows:
        available_library_rooms.append({
            "roomId": row[0],
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4]
        })

    return jsonify(available_library_rooms)


@app.route('/api/all_room_types', methods=['GET'])
def get_all_room_types():
    cur = mysql.connection.cursor()
    cur.execute("""SELECT DISTINCT room_type FROM `room_info` 
                WHERE room_type != 'Stairs'
                AND room_type != 'Toilet'
                AND room_type != 'Elevator'
                """)
    
    rows = cur.fetchall()
    cur.close()

    # Prepare the library_rooms_type
    library_rooms_type = []
    library_rooms_type.append({"type": "All"})

    for row in rows:
        library_rooms_type.append({
            "type": row[0],
        })

    # Debug print to console
    print("Returning data:", library_rooms_type)
    
    # Make sure we're returning a properly formatted JSON array
    return jsonify(library_rooms_type)


@app.route('/api/available_rooms', methods=['GET'])
def get_available_rooms():

    start_dt = datetime.strptime(request.args.get('start_date_time'), "%Y-%m-%d %H:%M:%S")
    end_dt = datetime.strptime(request.args.get('end_date_time'), "%Y-%m-%d %H:%M:%S")
    room_type = request.args.get('roomType')

    if not start_dt or not end_dt:
        return jsonify({"error": "start_date_time and end_date_time are required"}), 400

    if not room_type:
        room_type = "All"

    start_dt_str = start_dt.strftime('%Y-%m-%d %H:%M:%S')
    end_dt_str = end_dt.strftime('%Y-%m-%d %H:%M:%S')

    cur = mysql.connection.cursor()

    if room_type == "All" or room_type == "":
        query = """
            SELECT * FROM room_info 
            WHERE room_id NOT IN (
                SELECT room_id 
                FROM class_schedule_info 
                WHERE 
                    (start_date_time >= %s AND start_date_time <= %s)  
                    OR 
                    (end_date_time >= %s AND end_date_time <= %s)
            )
            AND room_info.room_type NOT IN (%s, %s, %s)
            AND (room_info.room_name NOT LIKE %s AND room_info.room_name NOT LIKE %s)


        """
        params = (start_dt_str, end_dt_str, start_dt_str, end_dt_str, 'Stairs', 'Toilet', 'Elevator', 'Library', 'Apex Cafe')
        cur.execute(query, params)

    else:
        query = """
            SELECT * FROM room_info 
            WHERE room_id NOT IN (
                SELECT room_id 
                FROM class_schedule_info 
                WHERE 
                    (start_date_time >= %s AND start_date_time <= %s)  
                    OR 
                    (end_date_time >= %s AND end_date_time <= %s)
            ) 
            AND room_info.room_type NOT IN (%s, %s, %s) 
            AND room_type = %s
            AND (room_info.room_name NOT LIKE %s AND room_info.room_name NOT LIKE %s)
        """
        
        params = (start_dt_str, end_dt_str, start_dt_str, end_dt_str, 'Stairs', 'Toilet', 'Elevator', room_type, 'Library', 'Apex Cafe')
        cur.execute(query, params)

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    available_rooms = []
    for row in rows:
        available_rooms.append({
            "roomId": row[0],
            "roomName": row[1],
            "type": row[2],
            "description": row[3],
            "floor": row[4]
        })

    return jsonify(available_rooms)


@app.route('/api/current_bookings', methods=['GET'])
def get_current_bookings():

    student_id = request.args.get('student_id')

    if not student_id:
       return jsonify({"error": "Fetching data failed - student Id Required !"}), 400

    cur = mysql.connection.cursor()
    query = """
        SELECT rooms_booking_info.*, room_info.room_name, room_info.floor FROM rooms_booking_info LEFT JOIN room_info ON rooms_booking_info.room_id = room_info.room_id WHERE rooms_booking_info.student_id = %s
    """
    cur.execute(query, (student_id,))

    rows = cur.fetchall()
    cur.close()

    # Prepare the available rooms data
    current_bookings = []
    for row in rows:
        current_bookings.append({
            "booking_id": row[0],
            "room_id": row[1],
            "start_date_time": row[2],
            "end_date_time": row[3],
            "status": row[4],
            "student_id": row[5],
            "title": row[6],
            "room_name": row[7],
            "floor": row[8],
            
        })

    return jsonify(current_bookings)


@app.route('/api/book_room', methods=['POST'])
def book_room():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    required_fields = ['roomId', 'start_date_time', 'end_date_time', 'matriculationNumber', 'title']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing booking information"}), 400


    room_id = data['roomId']
    start_date_time = data['start_date_time']
    end_date_time = data['end_date_time']
    student_id = data['matriculationNumber']
    title = data['title']

    cur = mysql.connection.cursor()
    query = """
        INSERT INTO rooms_booking_info (room_id, start_date_time, end_date_time, status, student_id, title)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cur.execute(query, (room_id, start_date_time, end_date_time, '', student_id, title))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Booking successful!"}), 201


@app.route('/api/remove_booking/<bookingId>', methods=['DELETE'])
def remove_booking(bookingId):
    if not bookingId:
        return jsonify({ 'error': 'Booking ID is required.' }), 400

    cur = mysql.connection.cursor()
    query = "DELETE FROM rooms_booking_info WHERE booking_id = %s"
    cur.execute(query, (bookingId,))
    mysql.connection.commit()  # Make sure to commit after delete
    cur.close()
    return jsonify({ 'message': 'Booking removed successfully.' }), 200


@app.route('/api/history', methods=['GET'])
def get_history():
    cur = mysql.connection.cursor()
    cur.execute("SELECT * FROM navigation_history ORDER BY timestamp DESC")
    rows = cur.fetchall()
    columns = [col[0] for col in cur.description]
    result = [dict(zip(columns, row)) for row in rows]
    cur.close()
    return jsonify(result)


@app.route('/api/history', methods=['POST'])
def add_history():
    data = request.json
    from_room = data.get('from')
    to_room = data.get('to')
    floor_from = data.get('floorFrom')
    floor_to = data.get('floorTo')

    cur = mysql.connection.cursor()
    cur.execute("""
        INSERT INTO navigation_history (from_room, to_room, floor_from, floor_to)
        VALUES (%s, %s, %s, %s)
    """, (from_room, to_room, floor_from, floor_to))
    mysql.connection.commit()
    cur.close()

    return jsonify({"message": "Navigation history saved."})


@app.route('/api/history/<int:history_id>', methods=['DELETE'])
def delete_history_entry(history_id):
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM navigation_history WHERE id = %s", (history_id,))
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": f"Deleted route {history_id}."})

@app.route('/api/history', methods=['DELETE'])
def clear_all_history():
    cur = mysql.connection.cursor()
    cur.execute("DELETE FROM navigation_history")
    mysql.connection.commit()
    cur.close()
    return jsonify({"message": "All history cleared."})


# ======= CLASS SCHEDULE ROUTES =======
@app.route('/api/schedule_type', methods=['GET'])
def get_schedule_type():
    cur = mysql.connection.cursor()
    query = """
            SELECT COLUMN_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'class_schedule_info'
            AND COLUMN_NAME = 'schedule_type';
        """
    cur.execute(query)
    row = cur.fetchone() 
    cur.close()

    schedule_types = []

    if row:
        column_type = row[0]
        enum_values = column_type.strip("enum()").split(',')
        schedule_types = [v.strip("'") for v in enum_values]

    schedule_types_objects = [{"type": value} for value in schedule_types]

    return jsonify(schedule_types_objects)


@app.route('/api/class_schedules', methods=['GET'])
def get_class_schedules():
    cur = mysql.connection.cursor()
    query = """
        SELECT cs.schedule_id, cs.room_id, cs.start_date_time, cs.end_date_time, cs.schedule_type, cs.status, r.room_name, r.floor
        FROM class_schedule_info cs
        LEFT JOIN room_info r ON cs.room_id = r.room_id
        ORDER BY cs.start_date_time ASC
    """
    cur.execute(query)
    rows = cur.fetchall()
    cur.close()

    schedules = []
    for row in rows:
        schedules.append({
            "schedule_id": row[0],
            "room_id": row[1],
            "start_date_time": row[2],
            "end_date_time": row[3],
            "schedule_type": row[4],
            "status": row[5],
            "room_name": row[6],
            "floor": row[7]
        })

    return jsonify(schedules)


@app.route('/api/create_class_schedule', methods=['POST'])
def create_class_schedule():
    
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'Missing data'}), 400

    room_id = data.get('room_id')
    schedule_type = data.get('schedule_type')
    title = data.get('title')
    start_date_time = data.get('start_date_time')
    end_date_time = data.get('end_date_time')
    status = 'Booked'  # Default to 'Active' if not provided

    if not all([room_id, schedule_type, start_date_time, end_date_time]):
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        cur = mysql.connection.cursor()
        cur.execute("""
    INSERT INTO class_schedule_info (room_id, schedule_type, start_date_time, end_date_time, status, title)
    VALUES (%s, %s, %s, %s, %s, %s)
""", (room_id, schedule_type, start_date_time, end_date_time, status, title))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Schedule created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/class_schedule', methods=['GET'])
def get_class_schedule():
    try:
        cur = mysql.connection.cursor()
        query = """
            SELECT cs.schedule_id, cs.room_id, cs.start_date_time, cs.end_date_time, cs.schedule_type, cs.status, cs.title, r.room_name, r.room_type, r.floor
            FROM class_schedule_info cs
            LEFT JOIN room_info r ON cs.room_id = r.room_id
            ORDER BY cs.start_date_time ASC
        """
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()

        schedules = []
        for row in rows:
            schedules.append({
                "schedule_id": row[0],
                "room_id": row[1],
                "start_date_time": row[2],
                "end_date_time": row[3],
                "schedule_type": row[4],
                "status": row[5],
                "title": row[6],
                "room_name": row[7],
                "room_type": row[8],
                "floor": row[9]
            })

        
        return jsonify(schedules)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/update_class_schedule/<int:schedule_id>', methods=['PUT'])
def update_class_schedule(schedule_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Invalid or missing JSON body'}), 400

    try:
        cur = mysql.connection.cursor()
        query = """
            UPDATE class_schedule_info
            SET room_id = %s, schedule_type = %s, start_date_time = %s, end_date_time = %s, title = %s
            WHERE schedule_id = %s
            """
        cur.execute(query, (
            data['room_id'],
            data['schedule_type'],
            data['start_date_time'],
            data['end_date_time'],
            data['title'],  # New
            schedule_id
))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Schedule updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/delete_class_schedule/<int:schedule_id>', methods=['DELETE'])
def delete_class_schedule(schedule_id):
    try:
        cur = mysql.connection.cursor()
        cur.execute("DELETE FROM class_schedule_info WHERE schedule_id = %s", (schedule_id,))
        mysql.connection.commit()
        cur.close()
        return jsonify({'message': 'Schedule deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



if __name__ == '__main__':
    initialize_graphs()
    app.run(debug=True)




