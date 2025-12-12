# /// script
# requires-python = ">=3.13"
# dependencies = [
#     "networkx",
#     "haversine",
#     "numpy",
#     "matplotlib",
#     "scipy",
# ]
# ///

import hashlib
import logging
import json
import networkx as nx
import numpy as np
import os
import random
from haversine import haversine, Unit
from scipy.spatial import Delaunay


def get_shortest_path_between_cities(G, city1: str, city2: str) -> tuple[list[str], float]:
    """Find the shortest path between two cities using geographical distances.

    Args:
        city1: Starting city name
        city2: Destination city name

    Returns:
        Tuple of (list of city names representing the shortest path, total distance in km)

    Raises:
        ValueError: If either city is not in the network
        NetworkXNoPath: If no path exists between the cities
    """

    # Validate cities exist
    if city1 not in network["cities"] or city2 not in network["cities"]:
        raise ValueError("One or both cities not found in network")

    # Find shortest path and total distance
    path = nx.shortest_path(G, city1, city2, weight="weight")
    distance = nx.shortest_path_length(G, city1, city2, weight="weight")

    return path, distance


with open(os.path.join(os.path.dirname(__file__), "utils", "cities.json"), "r") as f:
    cities = json.load(f)

network = {
    "cities": cities,
    "links": [
        ["New York", "London"],
        ["Tokyo", "Sydney"],
        ["Paris", "Berlin"],
        ["Dubai", "Mumbai"],
        ["San Francisco", "Tokyo"],
        ["Toronto", "New York"],
        ["Shanghai", "Singapore"],
        ["Los Angeles", "Mexico City"],
        ["Istanbul", "Athens"],
        ["Madrid", "Rome"],
        ["Bangkok", "Hong Kong"],
        ["Seoul", "Shanghai"],
        ["Chicago", "Toronto"],
        ["Cape Town", "Nairobi"],
        ["Melbourne", "Auckland"],
        ["Kuala Lumpur", "Jakarta"],
        ["Rio de Janeiro", "Buenos Aires"],
        ["Berlin", "Prague"],
        ["Lima", "Bogota"],
        ["Montreal", "Miami"],
        ["Santiago", "Lima"],
        ["Vancouver", "San Francisco"],
        ["Boston", "Dublin"],
        ["Oslo", "Helsinki"],
        ["Sydney", "Brisbane"],
        ["Singapore", "Bangkok"],
        ["Zurich", "Vienna"],
        ["Tokyo", "Seoul"],
        ["Dubai", "Tel Aviv"],
        ["Doha", "Istanbul"],
        ["Athens", "Cairo"],
        ["Lisbon", "Madrid"],
        ["Warsaw", "Budapest"],
        ["Houston", "Phoenix"],
        ["Dallas", "Atlanta"],
        ["Stockholm", "Copenhagen"],
        ["Hanoi", "Ho Chi Minh City"],
        ["Casablanca", "Algiers"],
        ["Abu Dhabi", "Riyadh"],
        ["Nairobi", "Accra"],
        ["Moscow", "Tbilisi"],
        ["Addis Ababa", "Lagos"],
        ["Tehran", "Karachi"],
        ["Lahore", "Islamabad"],
        ["Dhaka", "Colombo"],
        ["Kathmandu", "New Delhi"],
        ["Ulaanbaatar", "Nur-Sultan"],
        ["Brussels", "Amsterdam"],
        ["Perth", "Jakarta"],
        ["Tashkent", "Bishkek"],
        ["London", "Paris"],
        ["Los Angeles", "San Francisco"],
        ["Hong Kong", "Seoul"],
        ["Chicago", "Boston"],
        ["Rome", "Vienna"],
        ["Miami", "Atlanta"],
        ["Cape Town", "Addis Ababa"],
        ["Jakarta", "Singapore"],
        ["Mexico City", "Bogota"],
        ["Montreal", "Toronto"],
        ["Dubai", "Doha"],
        ["New York", "Miami"],
        ["Tokyo", "Osaka"],
        ["Cairo", "Istanbul"],
        ["Berlin", "Warsaw"],
        ["Rio de Janeiro", "Lima"],
        ["Buenos Aires", "Santiago"],
        ["Melbourne", "Sydney"],
        ["Lisbon", "Dublin"],
        ["Helsinki", "Stockholm"],
        ["Ho Chi Minh City", "Bangkok"],
        ["Casablanca", "Nairobi"],
        ["Vienna", "Prague"],
        ["Dallas", "Houston"],
        ["Phoenix", "San Diego"],
        ["Vancouver", "Seattle"],
        ["Kuala Lumpur", "Manila"],
        ["Manila", "Taipei"],
        ["Taipei", "Hong Kong"],
        ["Nairobi", "Accra"],
        ["Accra", "Lagos"],
        ["Addis Ababa", "Luanda"],
        ["Luanda", "Cape Town"],
        ["Athens", "Rome"],
        ["Oslo", "Brussels"],
        ["Stockholm", "Helsinki"],
        ["Zurich", "Amsterdam"],
        ["Tel Aviv", "Istanbul"],
        ["Tehran", "Dubai"],
        ["Moscow", "Helsinki"],
        ["Doha", "Abu Dhabi"],
        ["Kuwait City", "Dubai"],
        ["Islamabad", "New Delhi"],
        ["Colombo", "Mumbai"],
        ["Karachi", "Tehran"],
        ["Yerevan", "Tbilisi"],
        ["Tbilisi", "Baku"],
        ["Kigali", "Nairobi"],
        ["Muscat", "Dubai"],
        ["Jeddah", "Riyadh"],
        ["Brisbane", "Perth"],
        ["Barcelona", "Paris"],
        ["Caracas", "Bogota"],
        ["Sao Paulo", "Buenos Aires"],
        ["Nairobi", "Addis Ababa"],
        ["Accra", "Lagos"],
        ["Luanda", "Kinshasa"],
        ["Wellington", "Auckland"],
        ["Perth", "Wellington"],
        ["Kigali", "Nairobi"],
        ["Mumbai", "New Delhi"],
        ["Lahore", "Karachi"],
        ["Nur-Sultan", "Almaty"],
        ["Tashkent", "Almaty"],
        ["Ulaanbaatar", "Beijing"],
        ["Beijing", "Shanghai"],
        ["Shanghai", "Hong Kong"],
        ["Hong Kong", "Tokyo"],
        ["Kyoto", "Osaka"],
        ["Tokyo", "Seoul"],
        ["Seoul", "Beijing"],
        ["Dubai", "Singapore"],
        ["Istanbul", "Bangkok"],
        ["Cairo", "Dubai"],
        ["Istanbul", "Casablanca"],
        ["Mumbai", "Singapore"],
        ["Dubai", "Bangkok"],
    ],
}


def make_cities_shortest_paths(target):
    # Create graph
    G = nx.Graph()
    G.add_nodes_from(network["cities"].keys())
    for a, b in network["links"]:
        distance = haversine(network["cities"][a], network["cities"][b], unit=Unit.KILOMETERS)
        G.add_edge(a, b, weight=distance)

    # validate that all cities are connected
    assert nx.is_connected(G)

    # Generate random city pairs
    random.seed(0)
    shortest_paths = []
    while len(shortest_paths) < 500:
        city1 = random.choice(list(network["cities"].keys()))
        city2 = random.choice(list(network["cities"].keys()))
        path, distance = get_shortest_path_between_cities(G, city1, city2)
        if len(path) > 2:
            answer = hashlib.sha256(",".join(path).encode()).hexdigest()
            row = {"city1": city1, "city2": city2, "length": len(path), "hash": answer}
            shortest_paths.append(row)

    with open(target, "w") as f:
        json.dump({"answers": shortest_paths, **network}, f, separators=(",", ":"))


def make_cities_regions(target) -> None:
    """Generate random non-overlapping polygons by merging Delaunay triangles.

    Creates regions by:
    1. Generating Delaunay triangulation from city coordinates
    2. Randomly merging adjacent triangles to form larger polygons
    3. Drawing the resulting regions on a world map
    """
    # Extract coordinates and create triangulation
    cities = list(network["cities"].keys())
    points = np.array([coords for coords in network["cities"].values()])
    tri = Delaunay(points)

    # Create adjacency graph of triangles
    n_triangles = tri.simplices.shape[0]
    adj_graph = {i: set() for i in range(n_triangles)}

    # Find adjacent triangles by checking shared edges
    for i in range(n_triangles):
        for j in range(i + 1, n_triangles):
            shared_vertices = set(tri.simplices[i]) & set(tri.simplices[j])
            if len(shared_vertices) == 2:  # They share an edge
                adj_graph[i].add(j)
                adj_graph[j].add(i)

    # Randomly merge triangles
    merged = set()
    cities_in_region = []
    regions = []
    random.seed(0)  # For reproducibility
    while len(merged) < n_triangles:
        # Find an unmerged triangle
        available = set(range(n_triangles)) - merged
        if not available:
            break

        # Start new region
        current = random.choice(list(available))
        region = {current}
        merged.add(current)

        # Randomly grow region by adding adjacent triangles
        target_size = random.randint(2, 5)  # Random size between 2-5 triangles
        neighbors = adj_graph[current] - merged

        while len(region) < target_size and neighbors:
            next_tri = random.choice(list(neighbors))
            region.add(next_tri)
            merged.add(next_tri)
            neighbors = set().union(*(adj_graph[i] for i in region)) - merged

        combined_simplices = set.union(*(set(tri.simplices[i]) for i in region))
        regions.append(region)
        cities_in_region.append([cities[i] for i in combined_simplices])

    # Calculate bounding box
    latitudes = [coords[0] for coords in network["cities"].values()]
    longitudes = [coords[1] for coords in network["cities"].values()]
    min_lat, max_lat = min(latitudes), max(latitudes)
    min_lon, max_lon = min(longitudes), max(longitudes)

    # Create a mapping of triangle indices to their corresponding regions
    triangle_to_region = {i: j for j, region in enumerate(regions) for i in region}

    drop_points = []
    while len(drop_points) < 100:
        lat = round(random.uniform(min_lat, max_lat), 4)
        lon = round(random.uniform(min_lon, max_lon), 4)
        # Check which region the point falls into using the Delaunay triangulation
        index = int(tri.find_simplex((lat, lon)))
        if index >= 0:  # Point is inside a triangle
            triangle = [(cities[i], *network["cities"][cities[i]]) for i in tri.simplices[index]]
            logging.debug("%r %r", (lat, lon), triangle)
            drop_points.append((triangle_to_region[index], [lat, lon]))

    # Generate 500 random triplets of drop_points
    answers = []
    while len(answers) < 500:
        points = random.sample(drop_points, 5)
        answer = ",".join(str(p[0] + 1) for p in points)
        hash = hashlib.sha256(answer.encode()).hexdigest()
        answers.append({"points": [p[1] for p in points], "hash": hash})

    with open(target, "w") as f:
        result = {"cities": network["cities"], "regions": cities_in_region, "groups": answers}
        json.dump(result, f, separators=(",", ":"))


def generate(filename, method):
    target = os.path.join(root, "public", filename)
    if not os.path.exists(target) or os.path.getmtime(__file__) > os.path.getmtime(target):
        method(target)


if __name__ == "__main__":
    root = os.path.join(os.path.dirname(__file__), "..")
    generate("data-cities-shortest-paths.json", make_cities_shortest_paths)
    generate("data-cities-regions.json", make_cities_regions)
