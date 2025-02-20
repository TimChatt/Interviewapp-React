import React from "react";
import { Box, Heading, Text, Button, VStack, Link as ChakraLink } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Admin = () => {
  return (
    <Box maxW="1000px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Admin Panel
      </Heading>

      {/* Admin Dashboard Navigation */}
      <Box bg="white" p="6" borderRadius="lg" shadow="md" mb="6">
        <Heading size="md" mb="4" color="gray.700">
          Admin Dashboard
        </Heading>
        <Box bg="gray.100" p="4" borderRadius="md" shadow="sm">
          <Heading size="sm" mb="2" color="gray.800">Pending User Approvals</Heading>
          <Text mb="4" color="gray.600">
            Review pending user registrations and approve them.
          </Text>
          <ChakraLink as={Link} to="/admin/dashboard">
            <Button colorScheme="purple" size="md">View Pending Approvals</Button>
          </ChakraLink>
        </Box>
      </Box>

      {/* Settings Section */}
      <Box bg="white" p="6" borderRadius="lg" shadow="md" mb="6">
        <Heading size="md" mb="4" color="gray.700">
          ⚙️ Settings
        </Heading>
        <Box bg="gray.100" p="4" borderRadius="md" shadow="sm">
          <Heading size="sm" mb="2" color="gray.800">Application Settings</Heading>
          <Text mb="4" color="gray.600">
            Configure general application settings such as theme, language, and default options.
          </Text>
          <Button colorScheme="blue" onClick={() => alert("Settings updated!")}>
            Update Settings
          </Button>
        </Box>
      </Box>

      {/* Security Section */}
      <Box bg="white" p="6" borderRadius="lg" shadow="md">
        <Heading size="md" mb="4" color="gray.700">
          🔒 Security
        </Heading>
        <VStack spacing="4" align="stretch">
          <Box bg="gray.100" p="4" borderRadius="md" shadow="sm">
            <Heading size="sm" mb="2" color="gray.800">Access Control</Heading>
            <Text mb="4" color="gray.600">
              Manage user roles and permissions to ensure secure access to the application.
            </Text>
            <Button colorScheme="red" onClick={() => alert("Access control updated!")}>
              Manage Access
            </Button>
          </Box>

          <Box bg="gray.100" p="4" borderRadius="md" shadow="sm">
            <Heading size="sm" mb="2" color="gray.800">Password Policies</Heading>
            <Text mb="4" color="gray.600">
              Define strong password policies to enhance application security.
            </Text>
            <Button colorScheme="orange" onClick={() => alert("Password policy updated!")}>
              Update Policy
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default Admin;
