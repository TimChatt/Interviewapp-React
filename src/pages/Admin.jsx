import React, { useEffect, useState, useContext } from "react";
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Select, Spinner, useToast, Input, Switch, VStack } from "@chakra-ui/react";
import { AuthContext } from "../contexts/AuthContext";

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [ipWhitelist, setIpWhitelist] = useState([]);
  const [newIp, setNewIp] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    fetchIpWhitelist();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error fetching users", status: "error" });
    }
  };

  const updateUserStatus = async (username, action, role = null) => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/users/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ username, action, role }),
      });
      if (response.ok) {
        toast({ title: `User ${action}d successfully`, status: "success" });
        fetchUsers();
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      toast({ title: "Error updating user", status: "error" });
    }
  };

  const fetchLogs = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/audit-logs", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error fetching logs", status: "error" });
    }
  };

  const fetchIpWhitelist = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/ip-whitelist", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      setIpWhitelist(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({ title: "Error fetching IP whitelist", status: "error" });
    }
  };

  const addIpToWhitelist = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/ip-whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ ip: newIp }),
      });
      if (response.ok) {
        toast({ title: "IP added successfully", status: "success" });
        fetchIpWhitelist();
        setNewIp("");
      }
    } catch (error) {
      toast({ title: "Error adding IP", status: "error" });
    }
  };

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Admin Panel
      </Heading>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Users</Tab>
          <Tab>Audit Logs</Tab>
          <Tab>IP Whitelist</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <Table>
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
                    <Td>{user.is_suspended ? "Suspended" : user.is_approved ? "Active" : "Pending"}</Td>
                    <Td>{user.role}</Td>
                    <Td>
                      <Button onClick={() => updateUserStatus(user.username, "approve")} colorScheme="green" size="sm">Approve</Button>
                      <Button onClick={() => updateUserStatus(user.username, "suspend")} colorScheme="red" size="sm" ml={2}>Suspend</Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <Table>
              <Thead>
                <Tr>
                  <Th>Admin</Th>
                  <Th>Action</Th>
                  <Th>Target User</Th>
                  <Th>Timestamp</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map((log, index) => (
                  <Tr key={index}>
                    <Td>{log.admin_username}</Td>
                    <Td>{log.action}</Td>
                    <Td>{log.target_username}</Td>
                    <Td>{log.timestamp}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <VStack>
              <Input placeholder="Enter IP" value={newIp} onChange={(e) => setNewIp(e.target.value)} />
              <Button onClick={addIpToWhitelist} colorScheme="blue">Add IP</Button>
              <Table>
                <Thead>
                  <Tr>
                    <Th>IP Address</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {ipWhitelist.map((ip, index) => (
                    <Tr key={index}><Td>{ip}</Td></Tr>
                  ))}
                </Tbody>
              </Table>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminPanel;
