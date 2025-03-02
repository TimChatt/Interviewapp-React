import React, { useEffect, useState, useContext } from "react";
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Table, Thead, Tbody, Tr, Th, Td, Button, Badge, Select, Spinner, useToast, Input, Switch, VStack } from "@chakra-ui/react";
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
  const [twoFA, setTwoFA] = useState(false);
  const [passwordPolicy, setPasswordPolicy] = useState("Strong");
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

  const fetchIpWhitelist = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/ip-whitelist", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      setIpWhitelist(data);
    } catch (error) {
      console.error("Error fetching IP whitelist:", error);
    }
  };

  const handleAddIp = async () => {
    try {
      await fetch("https://interviewappbe-production.up.railway.app/api/ip-whitelist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ ip: newIp })
      });
      toast({ title: "IP added to whitelist", status: "success", duration: 3000, isClosable: true });
      setNewIp("");
      fetchIpWhitelist();
    } catch (error) {
      console.error("Error adding IP:", error);
    }
  };

  const handleRemoveIp = async (ip) => {
    try {
      await fetch("https://interviewappbe-production.up.railway.app/api/ip-whitelist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ ip })
      });
      toast({ title: "IP removed from whitelist", status: "success", duration: 3000, isClosable: true });
      fetchIpWhitelist();
    } catch (error) {
      console.error("Error removing IP:", error);
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
            <VStack spacing={4} align="stretch">
              <Text fontWeight="bold">Two-Factor Authentication</Text>
              <Switch isChecked={twoFA} onChange={(e) => setTwoFA(e.target.checked)} />
              <Text fontWeight="bold">Password Policy</Text>
              <Select value={passwordPolicy} onChange={(e) => setPasswordPolicy(e.target.value)}>
                <option value="Weak">Weak</option>
                <option value="Moderate">Moderate</option>
                <option value="Strong">Strong</option>
              </Select>
              <Text fontWeight="bold">IP Whitelist</Text>
              <Input placeholder="Enter IP address" value={newIp} onChange={(e) => setNewIp(e.target.value)} />
              <Button colorScheme="blue" onClick={handleAddIp}>Add IP</Button>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>IP Address</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {ipWhitelist.map((ip, index) => (
                    <Tr key={index}>
                      <Td>{ip}</Td>
                      <Td>
                        <Button colorScheme="red" size="sm" onClick={() => handleRemoveIp(ip)}>Remove</Button>
                      </Td>
                    </Tr>
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
