import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Link as ChakraLink,
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
import { Link } from "react-router-dom";
import { FaCheck, FaTimes, FaPlus, FaTrash, FaUserShield } from "react-icons/fa";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [ips, setIps] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [ipAddress, setIpAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
    fetchIPs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchIPs = async () => {
    try {
      const response = await fetch("/api/ip-whitelist");
      const data = await response.json();
      setIps(data);
    } catch (error) {
      console.error("Error fetching IP whitelist:", error);
    }
  };

  const handleUserAction = (username, action) => {
    fetch("/api/users/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, action }),
    }).then(() => {
      fetchUsers();
      toast({ title: `User ${action}d successfully`, status: "success" });
    });
  };

  const handleRoleChange = (username) => {
    fetch("/api/users/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, action: "update-role", role: selectedRole }),
    }).then(() => {
      fetchUsers();
      toast({ title: `User role updated successfully`, status: "success" });
      setIsModalOpen(false);
    });
  };

  const handleIPAction = (action) => {
    fetch(`/api/ip-whitelist`, {
      method: action === "add" ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
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
                  {users.map((user) => (
                    <Tr key={user.username}>
                      <Td>{user.username}</Td>
                      <Td>{user.email}</Td>
                      <Td>{user.is_approved ? "Approved" : "Pending"}</Td>
                      <Td>{user.role}</Td>
                      <Td>
                        {!user.is_approved && (
                          <IconButton
                            icon={<FaCheck />}
                            colorScheme="green"
                            onClick={() => handleUserAction(user.username, "approve")}
                          />
                        )}
                        <IconButton
                          icon={<FaTimes />}
                          colorScheme="red"
                          ml={2}
                          onClick={() => handleUserAction(user.username, "suspend")}
                        />
                        <IconButton
                          icon={<FaUserShield />}
                          colorScheme="blue"
                          ml={2}
                          onClick={() => { setModalType("update-role"); setSelectedUser(user.username); setIsModalOpen(true); }}
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{modalType === "add-ip" ? "Add IP Address" : "Update User Role"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {modalType === "add-ip" ? (
              <FormControl>
                <FormLabel>IP Address</FormLabel>
                <Input value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel>Select Role</FormLabel>
                <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="interviewer">Interviewer</option>
                </Select>
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button colorScheme="blue" onClick={() => handleRoleChange(selectedUser)}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Admin;
