import React, { useEffect, useState, useContext } from "react";
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Select, Spinner, useToast } from "@chakra-ui/react";
import { AuthContext } from "../contexts/AuthContext";
import AdminDashboard from "./AdminDashboard";

const AdminPanel = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
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

  const handleRoleChange = async (username, newRole) => {
    try {
      await fetch(`https://interviewappbe-production.up.railway.app/api/users/${username}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ role: newRole })
      });
      toast({ title: `Role updated to ${newRole}`, status: "success", duration: 3000, isClosable: true });
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

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
                      <Select placeholder="Select Role" defaultValue={user.role} size="sm" onChange={(e) => handleRoleChange(user.username, e.target.value)}>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="User">User</option>
                      </Select>
                    </Td>
                    <Td>
                      {!user.is_approved && (
                        <Button colorScheme="green" size="sm" onClick={() => handleRoleChange(user.username, 'Approved')}>
                          Approve
                        </Button>
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
            <Text>Audit Logs: View system logs, track approvals, logins, changes</Text>
          </TabPanel>
          <TabPanel>
            <Text>Settings: API Keys, Integrations, Theme Customization</Text>
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
