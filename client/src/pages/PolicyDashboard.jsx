// PolicyDashboard.jsx
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
  Divider,
  IconButton,
  HStack,
  Collapse
} from "@chakra-ui/react";
import { FaCommentDots, FaTimes } from "react-icons/fa";

const PolicyDashboard = () => {
  const toast = useToast();
  const [policies, setPolicies] = useState([]);
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [chatQuery, setChatQuery] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Chat overlay states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]); // {sender: 'user'|'bot', text: string}

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

  // Chatbot query handler
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
    // Append user message to conversation
    const userMessage = { sender: "user", text: chatQuery };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatQuery("");
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
      const botMessage = { sender: "bot", text: data.answer };
      setChatMessages((prev) => [...prev, botMessage]);
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

  // Toggle chat overlay
  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  return (
    <Box maxW="900px" mx="auto" py="6" position="relative">
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
        <Heading size="md" mb="4">Ask a Question about Policies</Heading>
        <Textarea
          placeholder="Enter your question here..."
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
              <Heading size="sm" mb="2">Response:</Heading>
              <Text whiteSpace="pre-wrap">{chatResponse}</Text>
            </CardBody>
          </Card>
        )}
      </Box>

      <Box position="fixed" bottom="20px" right="20px" zIndex="2000">
        <IconButton
          icon={chatOpen ? <FaTimes /> : <FaCommentDots />}
          colorScheme="purple"
          onClick={toggleChat}
          aria-label="Toggle Chat"
        />
      </Box>
      <Collapse in={chatOpen} animateOpacity>
        <Box
          position="fixed"
          bottom="70px"
          right="20px"
          width="320px"
          height="420px"
          bg="gray.50"         // light gray background for contrast
          border="1px solid"
          borderColor="gray.300" // subtle border color
          borderRadius="md"
          p="4"
          zIndex="2000"
          display="flex"
          flexDirection="column"
          boxShadow="md"        // added shadow for depth
        >
          <Box mb="2" borderBottom="1px solid" borderColor="gray.300" pb="1">
            <Text fontSize="md" fontWeight="bold" color="gray.700">
              Policy Chat
            </Text>
          </Box>
          <Box flex="1" overflowY="auto" mb="2">
            <VStack align="stretch" spacing="3">
              {chatMessages.map((msg, index) => (
                <Box
                  key={index}
                  alignSelf={msg.sender === "user" ? "flex-end" : "flex-start"}
                  bg={msg.sender === "user" ? "purple.100" : "gray.200"}
                  borderRadius="md"
                  p="2"
                >
                  <Text fontSize="sm">{msg.text}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
          <HStack spacing="2">
            <Input
              placeholder="Ask a question..."
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleChatQuery();
              }}
              bg="white"
            />
            <Button colorScheme="purple" onClick={handleChatQuery} isLoading={chatLoading}>
              Send
            </Button>
          </HStack>
        </Box>
      </Collapse>
    </Box>
  );
};

export default PolicyDashboard;
