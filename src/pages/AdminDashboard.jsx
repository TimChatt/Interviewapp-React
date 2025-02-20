import React, { useEffect, useState, useContext, useRef } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td, Button, Spinner, Flex, VStack, useToast, 
  AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay
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

    const fetchPendingUsers = async () => {
      try {
        const response = await fetch("https://interviewappbe-production.up.railway.app/api/users/pending", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
          }
        });
        if (!response.ok) {
          console.error("Failed to fetch pending users");
          return;
        }
        const data = await response.json();
        setPendingUsers(data);
      } catch (error) {
        console.error("Error fetching pending users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, [user]);

  // Handle opening confirmation modal
  const handleOpenConfirm = (username) => {
    setSelectedUser(username);
    setIsOpen(true);
  };

  // Handle approving a user
  const handleApprove = () => {
    toast({
      title: "User Approved",
      description: `${selectedUser} has been approved.`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Remove approved user from the pending list
    setPendingUsers(pendingUsers.filter(user => user.username !== selectedUser));
    setIsOpen(false);
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
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {pendingUsers.map((pendingUser) => (
                <Tr key={pendingUser.username}>
                  <Td>{pendingUser.username}</Td>
                  <Td>{pendingUser.email}</Td>
                  <Td>
                    <Button 
                      colorScheme="green" 
                      size="sm" 
                      onClick={() => handleOpenConfirm(pendingUser.username)}
                    >
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
        <Button colorScheme="purple" onClick={() => navigate("/admin")}>
          Back to Admin Home
        </Button>
      </VStack>

      {/* Confirmation Modal */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={() => setIsOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Approve User
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to approve <strong>{selectedUser}</strong>? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleApprove} ml={3}>
                Approve
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminDashboard;
