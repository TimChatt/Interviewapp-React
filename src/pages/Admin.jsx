import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { AuthContext } from "../contexts/AuthContext";
import { FaCheck, FaTimes, FaPlus, FaTrash, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [ips, setIps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const toast = useToast();

  const API_BASE_URL = "https://interviewappbe-production.up.railway.app";

  // Ensure user is an admin
  useEffect(() => {
    if (!user) {
      navigate("/unauthorized");
      return;
    }

    // Normalize role (remove any extra quotes)
    const normalizedRole = user.role?.replace(/'/g, "").trim();
    if (normalizedRole !== "admin") {
      navigate("/unauthorized");
      return;
    }

    fetchUsers();
    fetchIPs();
  }, [user, navigate]);

  // Fetch Users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched Users:", data);
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error fetching users", status: "error" });
    }
  };

  // Fetch IP Whitelist
  const fetchIPs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ip-whitelist`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched IPs:", data);
      setIps(data);
    } catch (error) {
      console.error("Error fetching IP whitelist:", error);
      toast({ title: "Error fetching IP whitelist", status: "error" });
    }
  };

  // Handle user actions (approve/suspend)
  const handleUserAction = (username, action) => {
    fetch(`${API_BASE_URL}/api/users/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ username, action }),
    }).then(() => {
      fetchUsers();
      toast({ title: `User ${action}d successfully`, status: "success" });
    });
  };

  // Handle role change
  const handleRoleChange = (username) => {
    fetch(`${API_BASE_URL}/api/users/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ username, action: "update-role", role: selectedRole }),
    }).then(() => {
      fetchUsers();
      toast({ title: `User role updated successfully`, status: "success" });
      setIsModalOpen(false);
    });
  };

  // Handle IP actions (add/delete)
  const handleIPAction = (action) => {
    fetch(`${API_BASE_URL}/api/ip-whitelist`, {
      method: action === "add" ? "POST" : "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
      body: JSON.stringify({ ip: ipAddress }),
    }).then(() => {
      fetchIPs();
      toast({ title: `IP ${action}ed successfully`, status: "success" });
      setIsModalOpen(false);
      setIpAddress("");
    });
  };

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Admin Panel
      </Heading>

      <Tabs variant="soft-rounded" colorScheme="purple">
        <TabList>
          <Tab>User Management</Tab>
          <Tab>Security</Tab>
          <Tab>Audit Logs</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Username</Th>
                    <Th>Email</Th>
                    <Th>Status</Th>
                    <Th>Role</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {users.map((userData) => (
                    <Tr key={userData.username}>
                      <Td>{userData.username}</Td>
                      <Td>{userData.email}</Td>
                      <Td>{userData.is_approved ? "Approved" : "Pending"}</Td>
                      <Td>{userData.role?.replace(/'/g, "").trim()}</Td>
                      <Td>
                        {!userData.is_approved && (
                          <IconButton
                            icon={<FaCheck />}
                            colorScheme="green"
                            onClick={() => handleUserAction(userData.username, "approve")}
                          />
                        )}
                        <IconButton
                          icon={<FaTimes />}
                          colorScheme="red"
                          ml={2}
                          onClick={() => handleUserAction(userData.username, "suspend")}
                        />
                        <IconButton
                          icon={<FaUserShield />}
                          colorScheme="blue"
                          ml={2}
                          onClick={() => {
                            setModalType("update-role");
                            setSelectedUser(userData.username);
                            setIsModalOpen(true);
                          }}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel>
            <VStack align="stretch">
              <Heading size="md">IP Whitelist</Heading>
              {ips.map((ip) => (
                <Box key={ip} bg="gray.100" p="3" borderRadius="md" display="flex" justifyContent="space-between">
                  <Text>{ip}</Text>
                  <IconButton icon={<FaTrash />} colorScheme="red" onClick={() => handleIPAction("delete")} />
                </Box>
              ))}
              <Button leftIcon={<FaPlus />} colorScheme="blue" onClick={() => { setModalType("add-ip"); setIsModalOpen(true); }}>Add IP</Button>
            </VStack>
          </TabPanel>

          <TabPanel>
            <Text>Audit logs will be displayed here...</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Admin;
