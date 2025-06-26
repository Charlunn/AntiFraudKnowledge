# serializers.py
from rest_framework import serializers
# No need to import Node, Relationship, Record from neo4j driver anymore for this logic
from typing import List, Dict, Any, Set, Optional, Union, Tuple
import logging
import json # Used for potentially creating a fallback ID

logger = logging.getLogger(__name__)

# --- Helper Function to Get Node ID ---
# This is crucial as Nodes are dicts and lack a built-in unique ID like element_id
def get_node_id(node_dict: Dict[str, Any]) -> Optional[str]:
    """
    Attempts to extract or generate a unique ID for a node represented as a dictionary.
    Prioritizes 'node_id', then 'name'. Falls back to hashing dict content (less stable).
    Returns None if input is not a dictionary or ID cannot be determined.
    """
    if not isinstance(node_dict, dict):
        return None

    # 1. Prioritize a specific 'node_id' key if present
    if 'node_id' in node_dict:
        return str(node_dict['node_id'])

    # 2. Use 'name' as a fallback if it exists and is unique enough for your context
    if 'name' in node_dict:
        # Consider potential non-uniqueness of names. If names aren't unique,
        # this ID strategy will merge nodes incorrectly in the graph.
        return str(node_dict['name'])

    # 3. As a last resort (less reliable), create an ID based on hashing sorted content.
    # This ID might change if dictionary content order changes or types are inconsistent.
    try:
        # Sort items to ensure consistent hashing order
        sorted_items = sorted(node_dict.items())
        # Convert complex types (like neo4j.time) to string representation
        stringified_items = [(k, str(v)) for k, v in sorted_items]
        node_hash = hash(json.dumps(stringified_items))
        logger.debug(f"Generated fallback hash ID {node_hash} for node dict: {node_dict}")
        return str(node_hash)
    except Exception as e:
        logger.error(f"Could not generate fallback ID for node dict {node_dict}: {e}")
        return None


class EchartsGraphSerializer(serializers.Serializer):
    """
    Serializes Neo4j query results, received as a list of Python dictionaries,
    into the format required by ECharts graph charts ('nodes' and 'links').

    Adapts to input where nodes are dicts and relationships are tuples:
    e.g., {'n': dict, 'r': (start_node_dict, type_str, end_node_dict), 'm': dict}
    """
    nodes = serializers.ListField(
        child=serializers.DictField(),
        read_only=True,
        help_text="List of nodes for ECharts graph."
    )
    links = serializers.ListField(
        child=serializers.DictField(),
        read_only=True,
        help_text="List of links (relationships) for ECharts graph."
    )

    def _format_node(self, node_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Formats a node dictionary into an ECharts node dictionary."""
        if not isinstance(node_dict, dict):
            logger.warning(f"Expected a dictionary for node, but got {type(node_dict)}. Skipping.")
            return None

        node_id = get_node_id(node_dict)
        if node_id is None:
            logger.warning(f"Could not determine a unique ID for node: {node_dict}. Skipping node.")
            return None

        # 根据节点类型选择合适的显示名称属性
        # 检查节点是否有 'labels' 属性，这是 Neo4j 节点的标签列表
        labels = node_dict.get('labels', [])
        
        # 默认使用 name 属性
        node_name = node_dict.get('name', None)
        
        # 如果是 Keyword 节点，优先使用 term 属性
        if 'Keyword' in labels and 'term' in node_dict:
            node_name = node_dict['term']
        # 如果是 AssetFlow 节点，优先使用 method 属性
        elif 'AssetFlow' in labels and 'method' in node_dict:
            node_name = node_dict['method']
        
        # 如果仍然没有找到合适的名称，尝试其他可能的属性
        if node_name is None:
            # 按优先级尝试不同的属性
            for attr in ['name', 'term', 'method', 'description', 'type', 'value']:
                if attr in node_dict and node_dict[attr]:
                    node_name = node_dict[attr]
                    break
        
        # 如果所有尝试都失败，使用一个更友好的回退值而不是 node_id
        if node_name is None:
            # 尝试使用标签作为名称前缀
            if labels:
                node_name = f"{labels[0]}-{node_id[-8:]}"  # 使用标签和ID的最后8位
            else:
                node_name = f"Node-{node_id[-8:]}"  # 使用通用前缀和ID的最后8位

        # Simple category logic: Use 'type' or 'label' key if present, else default
        # You might need more specific logic based on your data's conventions
        category = node_dict.get('type', node_dict.get('label', 'Default'))

        # Convert all property values to string for simplicity in ECharts display
        # Handle potential complex types like neo4j.time explicitly if needed elsewhere
        properties = {k: str(v) for k, v in node_dict.items()}

        return {
            'id': node_id,
            'name': str(node_name), # Ensure name is string
            'category': str(category),
            'symbolSize': 30,
            'value': node_dict.get('value', 1), # Get 'value' if present
            'properties': properties, # Attach all properties
            # Add other ECharts specific attributes as needed
        }

    def _format_link(self, rel_tuple: Tuple) -> Optional[Dict[str, Any]]:
        """Formats a relationship tuple (start_node_dict, type_str, end_node_dict)
           into an ECharts link dictionary."""

        if not isinstance(rel_tuple, tuple) or len(rel_tuple) != 3:
            logger.warning(f"Expected a tuple of length 3 for relationship, got {rel_tuple}. Skipping.")
            return None

        start_node_dict, rel_type, end_node_dict = rel_tuple

        if not isinstance(start_node_dict, dict) or not isinstance(end_node_dict, dict):
            logger.warning(f"Relationship tuple contains non-dict nodes: {rel_tuple}. Skipping.")
            return None

        source_id = get_node_id(start_node_dict)
        target_id = get_node_id(end_node_dict)
        rel_type_str = str(rel_type) # Ensure type is string

        if source_id is None or target_id is None:
            logger.warning(f"Could not determine source/target ID for relationship: {rel_tuple}. Skipping link.")
            return None

        # Relationship properties seem absent in the tuple structure based on the sample
        # If properties exist on the relationship itself (not nodes), the input structure needs change
        rel_properties = {}

        return {
            'source': source_id,
            'target': target_id,
            'value': 1, # Default value, adjust if weight info is available
            'label': {
                'show': True,
                'formatter': rel_type_str
            },
            'lineStyle': {
                'width': 2,
                'curveness': 0.1
            },
            'properties': rel_properties, # Empty based on sample data
            'type': rel_type_str # Store type if needed
        }

    def to_representation(self, instance: Union[List[Dict], Any]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Transforms the input list of dictionaries (representing Neo4j results)
        into the ECharts nodes/links format.
        """
        nodes_data_dict: Dict[str, Dict[str, Any]] = {} # Stores unique nodes keyed by generated ID
        links_data: List[Dict[str, Any]] = []

        if not isinstance(instance, list):
            logger.warning(f"EchartsGraphSerializer received non-list input. Type: {type(instance)}. Returning empty graph.")
            return {'nodes': [], 'links': []}

        if not instance:
            logger.info("EchartsGraphSerializer received an empty list. Returning empty graph.")
            return {'nodes': [], 'links': []}

        logger.debug(f"Processing {len(instance)} records for ECharts graph.")

        for i, record in enumerate(instance):
            if not isinstance(record, dict):
                logger.warning(f"Record at index {i} is not a dict: {record}. Skipping.")
                continue

            # Keys expected based on the sample data printout
            node_n_dict = record.get('n')
            rel_tuple = record.get('r')
            node_m_dict = record.get('m')

            processed_node_ids_in_record = set()

            # Process node 'n'
            if isinstance(node_n_dict, dict):
                formatted_node = self._format_node(node_n_dict)
                if formatted_node:
                    node_id = formatted_node['id']
                    if node_id not in nodes_data_dict:
                         nodes_data_dict[node_id] = formatted_node
                    processed_node_ids_in_record.add(node_id)


            # Process node 'm'
            if isinstance(node_m_dict, dict):
                formatted_node = self._format_node(node_m_dict)
                if formatted_node:
                    node_id = formatted_node['id']
                    if node_id not in nodes_data_dict:
                         nodes_data_dict[node_id] = formatted_node
                    processed_node_ids_in_record.add(node_id)

            # Process relationship 'r'
            if isinstance(rel_tuple, tuple) and len(rel_tuple) == 3:
                 start_node_dict, _, end_node_dict = rel_tuple # _ ignores type for now

                 # Ensure start/end nodes from tuple are also added to nodes_data_dict
                 start_node_id = get_node_id(start_node_dict)
                 end_node_id = get_node_id(end_node_dict)

                 if start_node_id and start_node_id not in nodes_data_dict:
                      formatted_start_node = self._format_node(start_node_dict)
                      if formatted_start_node:
                           nodes_data_dict[start_node_id] = formatted_start_node

                 if end_node_id and end_node_id not in nodes_data_dict:
                      formatted_end_node = self._format_node(end_node_dict)
                      if formatted_end_node:
                           nodes_data_dict[end_node_id] = formatted_end_node

                 # Format the link only if both nodes could be identified
                 if start_node_id and end_node_id:
                      formatted_link = self._format_link(rel_tuple)
                      if formatted_link:
                          links_data.append(formatted_link)
                 else:
                      logger.warning(f"Skipping link due to missing node IDs in tuple: {rel_tuple}")

            elif rel_tuple is not None: # Log if 'r' exists but isn't the expected tuple
                 logger.warning(f"Record {i} has 'r' key but it's not a valid relationship tuple: {rel_tuple}")


        final_nodes_list = list(nodes_data_dict.values())
        logger.info(f"Serialized {len(final_nodes_list)} unique nodes and {len(links_data)} links for ECharts.")

        return {'nodes': final_nodes_list, 'links': links_data}


# ==============================================================
# NodeDetailSerializer - Also needs adaptation for Dict input
# ==============================================================

class NodeDetailSerializer(serializers.Serializer):
    """
    Serializes detailed information for a specific node and its immediate neighbors,
    assuming input is a list of dictionaries where nodes are dicts and relationships
    are tuples: {'n': target_node_dict, 'r': (node1_dict, type, node2_dict), 'm': neighbor_dict}
    """
    node_properties = serializers.DictField(read_only=True, help_text="Properties of the target node.")
    neighbors = serializers.ListField(
        child=serializers.DictField(),
        read_only=True,
        help_text="List of neighbors connected by relationships."
    )

    def to_representation(self, instance: Union[List[Dict], Any]) -> Dict[str, Any]:
        """
        Transforms the query result list into a structured node detail JSON.
        """
        if not isinstance(instance, list):
            logger.warning(f"NodeDetailSerializer received non-list input. Type: {type(instance)}. Returning empty details.")
            return {'node_properties': {}, 'neighbors': []}

        if not instance:
            logger.info("NodeDetailSerializer received an empty list. Returning empty details.")
            return {'node_properties': {}, 'neighbors': []}

        target_node_dict: Optional[Dict] = None
        node_properties: Dict[str, Any] = {}
        neighbors_data: List[Dict[str, Any]] = []
        neighbor_ids_seen: Set[str] = set() # Track processed unique neighbors

        # Try to get target node from the first record's 'n' key
        first_record = instance[0]
        if isinstance(first_record, dict) and isinstance(first_record.get('n'), dict):
            target_node_dict = first_record['n']
            target_node_id = get_node_id(target_node_dict)
            if target_node_id:
                 node_properties = {k: str(v) for k, v in target_node_dict.items()}
                 node_properties['calculated_id'] = target_node_id # Add the ID we use
                 # Extract labels if a 'labels' key exists (seems missing in sample)
                 node_properties['labels'] = target_node_dict.get('labels', [])
                 logger.info(f"Processing details for target node identified as: {target_node_id}")
            else:
                 logger.error("NodeDetailSerializer: Could not determine ID for target node 'n' in first record.")
                 return {'node_properties': {}, 'neighbors': []}
        else:
            logger.error("NodeDetailSerializer: Target node 'n' (dict) not found or invalid in the first record.")
            return {'node_properties': {}, 'neighbors': []}


        for i, record in enumerate(instance):
            if not isinstance(record, dict):
                logger.warning(f"Record at index {i} for NodeDetail is not a dict: {record}. Skipping.")
                continue

            rel_tuple = record.get('r')
            neighbor_node_dict = record.get('m') # Assume 'm' is the neighbor relative to 'n'

            # Check if we have a valid relationship tuple and neighbor dict
            if isinstance(rel_tuple, tuple) and len(rel_tuple) == 3 and isinstance(neighbor_node_dict, dict):
                rel_start_node_dict, rel_type, rel_end_node_dict = rel_tuple
                rel_type_str = str(rel_type)

                # Determine direction and identify the actual neighbor dict from the tuple
                # This part is tricky without element_id. We compare dicts directly or use generated IDs.
                current_neighbor_dict = None
                direction = 'unknown'
                start_node_id = get_node_id(rel_start_node_dict)
                end_node_id = get_node_id(rel_end_node_dict)

                # If start node in tuple matches target node, then end node is the neighbor
                if start_node_id == target_node_id:
                    direction = 'outgoing'
                    current_neighbor_dict = rel_end_node_dict
                    current_neighbor_id = end_node_id
                # If end node in tuple matches target node, then start node is the neighbor
                elif end_node_id == target_node_id:
                    direction = 'incoming'
                    current_neighbor_dict = rel_start_node_dict
                    current_neighbor_id = start_node_id
                else:
                    # This might happen if the query structure is different than assumed (n)-[r]-(m)
                    # Or if ID generation is inconsistent
                    logger.warning(f"Record {i}: Relationship tuple {rel_tuple} doesn't seem directly connected to target node {target_node_id}. Trying 'm' key.")
                    # Fallback to using the 'm' node directly if tuple doesn't match target
                    if neighbor_node_dict:
                         current_neighbor_dict = neighbor_node_dict
                         current_neighbor_id = get_node_id(neighbor_node_dict)
                         # Direction is ambiguous here without comparing tuple nodes to target
                         direction = 'related (via m)'
                    else:
                         current_neighbor_id = None


                if current_neighbor_dict and current_neighbor_id:
                    # Check if we've already added this neighbor
                    if current_neighbor_id not in neighbor_ids_seen:
                        neighbor_properties = {k: str(v) for k, v in current_neighbor_dict.items()}
                        # Relationship properties are not in the tuple structure, assume empty
                        relationship_properties = {}

                        neighbors_data.append({
                            'relationship_type': rel_type_str,
                            'relationship_properties': relationship_properties,
                            # 'relationship_element_id': # Not available from tuple
                            'direction': direction,
                            'neighbor_id': current_neighbor_id, # The generated/extracted ID
                            'neighbor_labels': neighbor_properties.get('labels', []), # Get labels if key exists
                            'neighbor_name': neighbor_properties.get('name', current_neighbor_id),
                            'neighbor_properties': neighbor_properties,
                        })
                        neighbor_ids_seen.add(current_neighbor_id)
                # else:
                    # logger.debug(f"Record {i}: Could not identify neighbor or its ID.")

            # else:
                 # logger.debug(f"Record {i}: Missing valid relationship tuple or neighbor dict 'm'.")


        logger.info(
            f"Serialized details for node {node_properties.get('calculated_id', 'N/A')} "
            f"with {len(neighbors_data)} unique neighbor connections."
        )
        return {'node_properties': node_properties, 'neighbors': neighbors_data}