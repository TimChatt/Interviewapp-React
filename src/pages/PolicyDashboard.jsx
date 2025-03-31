import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Button,
  Text,
  VStack,
  Input,
  Textarea,
  Spinner,
  useToast,
  Card,
  CardBody,
  List,
  ListItem,
  Divider
} from "@chakra-ui/react";

const PolicyDashboard = () => {
  const toast = useToast();
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Fetch policies from backend
  const fetchPolicies = async () => {
    setLoadingPolicies(true);
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/get-policies"
      );
      if (!response.ok) throw new Error("Failed to fetch policies");
      const data = await response.json();
      setPolicies(data.policies);
    } catch (error) {
      toast({
        title: "Error fetching policies",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingPolicies(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  // Upload a new policy
  const handleUpload = async () => {
    if (!uploadText) {
      toast({
        title: "Empty Upload",
        description: "Please enter policy text to upload.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/upload-policy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ policyText: uploadText }),
        }
      );
      if (!response.ok) throw new Error("Failed to upload policy");
      await response.json();
      toast({
        title: "Policy Uploaded",
        description: "Policy uploaded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setUploadText("");
      fetchPolicies(); // refresh list
    } catch (error) {
      toast({
        title: "Error uploading policy",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle chatbot query
  const handleChatQuery = async () => {
    if (!chatQuery) {
      toast({
        title: "Empty Query",
        description: "Please enter a query.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setChatLoading(true);
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/query-policy",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: chatQuery }),
        }
      );
      if (!response.ok) throw new Error("Failed to query policies");
      const data = await response.json();
      setChatResponse(data.answer);
    } catch (error) {
      toast({
        title: "Error in query",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <Box maxW="900px" mx="auto" py="6">
      <Heading size="xl" textAlign="center" mb="6">
        Policy Dashboard
      </Heading>

      {/* List Stored Policies */}
      <Box mb="8">
        <Heading size="md" mb="4">Stored Policies</Heading>
        {loadingPolicies ? (
          <Spinner />
        ) : (
          <List spacing={3}>
            {policies.map((policy) => (
              <ListItem key={policy.id}>
                <Card>
                  <CardBody>
                    <Heading size="sm">
                      {policy.title || "Policy"}
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(policy.created_at).toLocaleString()}
                    </Text>
                    <Divider my="2" />
                    <Text noOfLines={3}>{policy.content}</Text>
                  </CardBody>
                </Card>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Upload Policy Section */}
      <Box mb="8">
        <Heading size="md" mb="4">Upload New Policy</Heading>
        <Textarea
          placeholder="Paste policy text here..."
          value={uploadText}
          onChange={(e) => setUploadText(e.target.value)}
          mb="2"
        />
        <Button colorScheme="blue" onClick={handleUpload}>
          Upload Policy
        </Button>
      </Box>

      {/* Chatbot Section */}
      <Box mb="8">
        <Heading size="md" mb="4">Policy Chatbot</Heading>
        <Textarea
          placeholder="Ask a question about the policies..."
          value={chatQuery}
          onChange={(e) => setChatQuery(e.target.value)}
          mb="2"
        />
        <Button colorScheme="purple" onClick={handleChatQuery} isLoading={chatLoading}>
          Ask
        </Button>
        {chatResponse && (
          <Card mt="4">
            <CardBody>
              <Heading size="sm" mb="2">Chatbot Response:</Heading>
              <Text whiteSpace="pre-wrap">{chatResponse}</Text>
            </CardBody>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default PolicyDashboard;
