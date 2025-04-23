// stores/graph.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios'; // Import axios

const API_BASE_URL = 'http://127.0.0.1:8000/api'; // 或者使用 runtimeConfig

// 辅助函数：清理重复的 links (你的 API 示例数据里有重复)
const deduplicateLinks = (links) => {
    const seen = new Set();
    return links.filter(link => {
        // Use a consistent key order for deduplication
        const key = `${link.source}-${link.target}-${link.type || link.label?.formatter}`;
        // Also consider the reverse for undirected graphs if necessary, though your types seem directional
        // const reverseKey = `${link.target}-${link.source}-${link.type || link.label?.formatter}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        // seen.add(reverseKey); // Uncomment if relationships are truly undirected and you want to prevent duplicates regardless of source/target order for the same type
        return true;
    });
};


export const useGraphStore = defineStore('graph', () => {
    const initialNodes = ref([]);
    const initialLinks = ref([]);
    const currentNodes = ref([]);
    const currentLinks = ref([]);
    const isLoading = ref(false);
    const isNeighborView = ref(false); // 是否处于查看邻居节点的状态
    const selectedNodeDetails = ref(null); // Store details of the double-clicked node
    const error = ref(null);

    // --- Actions ---

    // 获取初始图谱数据
    async function fetchInitialGraph() {
        isLoading.value = true;
        error.value = null;
        isNeighborView.value = false; // 切换回完整视图
        selectedNodeDetails.value = null; // Clear selected node details
        console.log('Fetching initial graph data...'); // Log start
        try {
            // Use axios
            const response = await axios.get(`${API_BASE_URL}/graph/initial/`);
            const data = response.data; // Extract data from axios response

            console.log('--- API Response (Initial Graph) ---');
            console.log(JSON.stringify(data, null, 2)); // Log the received JSON data
            console.log('-----------------------------------');

            initialNodes.value = data.nodes || [];
            initialLinks.value = deduplicateLinks(data.links || []); // 去重
            currentNodes.value = [...initialNodes.value];
            currentLinks.value = [...initialLinks.value];

        } catch (err) {
            console.error('Error fetching initial graph:', err);
            // Log detailed Axios error if available
            if (err.response) {
                console.error('Error Response Data:', err.response.data);
                console.error('Error Response Status:', err.response.status);
                console.error('Error Response Headers:', err.response.headers);
            } else if (err.request) {
                console.error('Error Request:', err.request);
            } else {
                console.error('Error Message:', err.message);
            }
            error.value = 'Failed to load initial graph data. Check console for details.';
            initialNodes.value = [];
            initialLinks.value = [];
            currentNodes.value = [];
            currentLinks.value = [];
        } finally {
            isLoading.value = false;
            console.log('Finished fetching initial graph data.'); // Log end
        }
    }

    // 获取过滤后的图谱数据
    async function fetchFilteredGraph(filterProp, filterValue) {
        if (!filterProp || !filterValue) {
            error.value = 'Filter property and value are required.';
            return;
        }
        isLoading.value = true;
        error.value = null;
        isNeighborView.value = false; // 切换回完整视图 (因为是新过滤)
        selectedNodeDetails.value = null; // Clear selected node details
        console.log(`Fetching filtered graph data (Prop: ${filterProp}, Value: ${filterValue})...`); // Log start
        try {
            // Use axios with params configuration
            const response = await axios.get(`${API_BASE_URL}/graph/filtered/`, {
                params: {
                    filter_prop: filterProp,
                    filter_value: filterValue
                }
            });
            const data = response.data; // Extract data

            console.log(`--- API Response (Filtered Graph: ${filterProp}=${filterValue}) ---`);
            console.log(JSON.stringify(data, null, 2)); // Log the received JSON data
            console.log('-----------------------------------');

            currentNodes.value = data.nodes || [];
            currentLinks.value = deduplicateLinks(data.links || []); // 去重
        } catch (err) {
            console.error('Error fetching filtered graph:', err);
            if (err.response) {
                console.error('Error Response Data:', err.response.data);
                console.error('Error Response Status:', err.response.status);
                console.error('Error Response Headers:', err.response.headers);
            } else if (err.request) {
                console.error('Error Request:', err.request);
            } else {
                console.error('Error Message:', err.message);
            }
            error.value = 'Failed to load filtered graph data. Check console for details.';
            currentNodes.value = [];
            currentLinks.value = [];
        } finally {
            isLoading.value = false;
            console.log('Finished fetching filtered graph data.'); // Log end
        }
    }

    // 获取节点及其邻居
    async function fetchNodeNeighbors(nodeId) {
        isLoading.value = true;
        error.value = null;
        console.log(`Fetching neighbors for node ID: ${nodeId}...`); // Log start
        try {
            // Use axios
            const response = await axios.get(`${API_BASE_URL}/nodes/${nodeId}/`);
            const data = response.data; // Extract data

            console.log(`--- API Response (Node Neighbors: ${nodeId}) ---`);
            console.log(JSON.stringify(data, null, 2)); // Log the received JSON data
            console.log('-----------------------------------');

            if (!data || !data.node_properties) {
                throw new Error(`Invalid data received for node ${nodeId}`);
            }

            // Store selected node details for potential display elsewhere
            selectedNodeDetails.value = data.node_properties;

            const centerNode = {
                id: data.node_properties.node_id || data.node_properties.calculated_id || nodeId, // Use node_id or calculated_id, fallback to input nodeId
                name: data.node_properties.name,
                properties: data.node_properties,
                symbolSize: 40, // 突出中心节点
                category: 'Center', // 可以设置特殊分类
                value: data.node_properties.value || 1, // 使用属性中的 value 或默认值
                itemStyle: { // Add specific style for center node
                    borderColor: 'red',
                    borderWidth: 2
                }
            };

            const neighborNodesMap = new Map(); // Use Map to avoid duplicate neighbor nodes
            const neighborLinks = [];

            if (data.neighbors && Array.isArray(data.neighbors)) {
                data.neighbors.forEach(neighborInfo => {
                    // Add neighbor node if not already added
                    if (!neighborNodesMap.has(neighborInfo.neighbor_id)) {
                        neighborNodesMap.set(neighborInfo.neighbor_id, {
                            id: neighborInfo.neighbor_id,
                            name: neighborInfo.neighbor_name,
                            properties: neighborInfo.neighbor_properties,
                            symbolSize: 30,
                            category: neighborInfo.neighbor_properties?.type || 'Neighbor', // 尝试用类型作为分类
                            value: neighborInfo.neighbor_properties?.value || 1
                        });
                    }

                    // Create connecting link
                    const link = {
                        source: neighborInfo.direction === 'incoming' ? neighborInfo.neighbor_id : centerNode.id,
                        target: neighborInfo.direction === 'incoming' ? centerNode.id : neighborInfo.neighbor_id,
                        value: 1, // 或者基于关系属性设置
                        label: {
                            show: true,
                            formatter: neighborInfo.relationship_type || ''
                        },
                        lineStyle: {
                            width: 2,
                            curveness: 0.1
                        },
                        properties: neighborInfo.relationship_properties,
                        type: neighborInfo.relationship_type || 'RELATED_TO' // 关系类型
                    };
                    neighborLinks.push(link);
                });
            }

            const neighborNodes = Array.from(neighborNodesMap.values());

            currentNodes.value = [centerNode, ...neighborNodes];
            currentLinks.value = deduplicateLinks(neighborLinks); // 去重
            isNeighborView.value = true; // 设置为查看邻居状态

        } catch (err) {
            console.error(`Error fetching neighbors for node ${nodeId}:`, err);
            if (err.response) {
                console.error('Error Response Data:', err.response.data);
                console.error('Error Response Status:', err.response.status);
                console.error('Error Response Headers:', err.response.headers);
            } else if (err.request) {
                console.error('Error Request:', err.request);
            } else {
                console.error('Error Message:', err.message);
            }
            error.value = `Failed to load neighbors for node ${nodeId}. Check console for details.`;
            selectedNodeDetails.value = null; // Clear selection on error
            // Decide if you want to revert to the initial graph or stay on the potentially broken neighbor view
            // showInitialGraph(); // Option: revert to initial graph on error
        } finally {
            isLoading.value = false;
            console.log(`Finished fetching neighbors for node ID: ${nodeId}.`); // Log end
        }
    }

    // 返回初始图谱视图
    function showInitialGraph() {
        console.log('Returning to initial graph view...'); // Log action
        // Always reset state, fetch if initial data isn't available
        isLoading.value = true; // Show loading briefly during reset
        error.value = null;
        isNeighborView.value = false;
        selectedNodeDetails.value = null;
        if (initialNodes.value.length > 0 || initialLinks.value.length > 0) {
            currentNodes.value = [...initialNodes.value];
            currentLinks.value = [...initialLinks.value];
            isLoading.value = false; // Hide loading
        } else {
            // If initial data was never loaded (e.g., first load failed), fetch it again.
            console.log('Initial data missing, refetching...');
            fetchInitialGraph(); // This will handle isLoading=false internally
        }
    }

    return {
        currentNodes,
        currentLinks,
        isLoading,
        isNeighborView,
        selectedNodeDetails, // Expose selected node details
        error,
        fetchInitialGraph,
        fetchFilteredGraph,
        fetchNodeNeighbors,
        showInitialGraph,
    };
});