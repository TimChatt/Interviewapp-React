import React, { useEffect, useState, useContext } from "react";
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Select, Spinner, useToast, Input } from "@chakra-ui/react";
import { AuthContext } from "../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
    fetchLogs();
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
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
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
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const filteredLogs = logs.filter(log => 
    (filterUser ? log.username.includes(filterUser) : true) &&
    (filterAction ? log.action.includes(filterAction) : true) &&
    (filterDate ? log.timestamp.startsWith(filterDate) : true)
  );

  if (loading) {
    return <Spinner size="xl" color="purple.500" />;
  }

  return (
    <Box maxW="1200px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Admin Panel
      </Heading>

      <Tabs variant="enclosed">
        <TabList>
          <Tab>Dashboard</Tab>
          <Tab>Users</Tab>
          <Tab>Access Control</Tab>
          <Tab>Audit Logs</Tab>
          <Tab>Settings</Tab>
          <Tab>Security</Tab>
          <Tab>Data & Exports</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <AdminDashboard />
          </TabPanel>
          <TabPanel>
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
                    <Td>
                      <Badge colorScheme={user.is_approved ? "green" : "yellow"}>{user.is_approved ? "Approved" : "Pending"}</Badge>
                    </Td>
                    <Td>
                      <Select placeholder="Select Role" defaultValue={user.role} size="sm">
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="User">User</option>
                      </Select>
                    </Td>
                    <Td>
                      {!user.is_approved && (
                        <Button colorScheme="green" size="sm">Approve</Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <Text>Access Control: Role-Based Access, Permissions Management</Text>
          </TabPanel>
          <TabPanel>
            <Box mb="4">
              <Input placeholder="Filter by User" value={filterUser} onChange={(e) => setFilterUser(e.target.value)} mb={2} />
              <Input placeholder="Filter by Action" value={filterAction} onChange={(e) => setFilterAction(e.target.value)} mb={2} />
              <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
            </Box>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Action</Th>
                  <Th>User</Th>
                  <Th>Timestamp</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredLogs.map((log, index) => (
                  <Tr key={index}>
                    <Td>{log.action}</Td>
                    <Td>{log.username}</Td>
                    <Td>{new Date(log.timestamp).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <Text>Security: 2FA, Password Policy, IP Whitelisting</Text>
          </TabPanel>
          <TabPanel>
            <Text>Data Management: Export Users, Logs, Activity (CSV/JSON)</Text>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AdminPanel;
