import React from "react";
import { Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Text, Button, VStack } from "@chakra-ui/react";
import AdminDashboard from "./AdminDashboard";

const AdminPanel = () => {
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
            <Text>User Management (View, Approve, Reject, Assign Roles, Suspend/Reactivate)</Text>
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
