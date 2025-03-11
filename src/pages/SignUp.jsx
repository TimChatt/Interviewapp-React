import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  Box,
  Heading,
  Input,
  Button,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  VStack,
  Text,
  Flex,
} from "@chakra-ui/react";

const SignUp = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        "https://interviewappbe-production.up.railway.app/api/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, email }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMessage("✅ Registration successful. Await admin approval.");
        setIsError(false);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.detail || "An error occurred.");
        setIsError(true);
      }
    } catch (error) {
      setMessage("❌ Failed to sign up. Please try again later.");
      setIsError(true);
      console.error(error);
    }
  };

  return (
    <Flex width="100vw" minH="100vh">
      {/* Left Panel - Sony Branding */}
      <Box width="50%" height="100vh" bg="black" color="white" display="flex" alignItems="center" justifyContent="center">
        <Box textAlign="center">
          {/* Sony Logo (Single Instance, Fixing Duplication) */}
          <img
            src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
            alt="Sony Logo"
            style={{
              width: "180px",
              marginBottom: "20px",
              filter: "brightness(0) invert(1)",
            }}
          />
          <Text mt={2} fontSize="lg">Innovation that Moves the World</Text>
        </Box>
      </Box>

      {/* Right Panel - Sign Up Form */}
      <Flex width="50%" alignItems="center" justifyContent="center">
        <Box
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          width="400px"
          textAlign="center"
        >
          <Heading mb={4} size="lg" color="black">
            Sign Up
          </Heading>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  bg="gray.100"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="gray.100"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="gray.100"
                />
              </FormControl>

              <Button type="submit" bg="black" color="white" _hover={{ bg: "gray.800" }} width="full">
                Sign Up
              </Button>
            </VStack>
          </form>

          {message && (
            <Alert status={isError ? "error" : "success"} mt={4}>
              <AlertIcon />
              {message}
            </Alert>
          )}

          {/* Login Redirect */}
          <Text mt={4}>
            Already have an account?{" "}
            <Text as="span" color="black" fontWeight="bold" cursor="pointer" onClick={() => navigate("/login")}>
              Login here
            </Text>
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default SignUp;
