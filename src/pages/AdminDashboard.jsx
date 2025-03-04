import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Flex, VStack, useToast, 
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Badge
} from "@chakra-ui/react";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const cancelRef = useRef();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchPendingUsers();
  }, [user]);

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("https://interviewappbe-production.up.railway.app/api/users/pending", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch pending users");
      }
      const data = await response.json();
      setPendingUsers(data);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (username) => {
    try {
      const response = await fetch(`https://interviewappbe-production.up.railway.app/api/users/${username}/approve`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to approve user");
      }
      toast({ title: "User Approved", status: "success", duration: 3000, isClosable: true });
      setPendingUsers(pendingUsers.filter(user => user.username !== username));
      setIsOpen(false);
    } catch (error) {
      console.error("Error approving user:", error);
      toast({ title: "Approval Failed", description: error.message, status: "error", duration: 3000, isClosable: true });
    }
  };

  if (loading) {
    return (
      <Flex height="100vh" justify="center" align="center">
        <Spinner size="xl" color="purple.500" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex height="100vh" justify="center" align="center">
        <Text fontSize="lg" color="gray.600">Please log in as an admin to access this page.</Text>
      </Flex>
    );
  }

  return (
    <Box maxW="1000px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        Admin Dashboard - Pending User Approvals
      </Heading>

      <Box bg="white" p="6" borderRadius="lg" shadow="md">
        {pendingUsers.length === 0 ? (
          <Text fontSize="lg" color="gray.600" textAlign="center">No pending users.</Text>
        ) : (
          <Table variant="simple">
            <Thead bg="gray.100">
              <Tr>
                <Th>Username</Th>
                <Th>Email</Th>
                <Th>Status</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pendingUsers.map((pendingUser) => (
                <Tr key={pendingUser.username}>
                  <Td>{pendingUser.username}</Td>
                  <Td>{pendingUser.email}</Td>
                  <Td>
                    <Badge colorScheme="yellow">Pending</Badge>
                  </Td>
                  <Td>
                    <Button colorScheme="green" size="sm" onClick={() => handleApprove(pendingUser.username)}>
                      Approve
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      <VStack mt="6">
        <Button colorScheme="purple" onClick={() => navigate("/admin")}>Back to Admin Home</Button>
      </VStack>
    </Box>
  );
};

export default AdminDashboard;
