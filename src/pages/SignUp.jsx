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

// Consistent Black Box with White Text
const Paper = (props) => (
  <Box
    bg="black"
    border="2px solid rgba(255, 255, 255, 0.2)"
    borderRadius="15px"
    p="30px"
    width="400px"
    textAlign="center"
    boxShadow="0px 0px 15px rgba(255, 255, 255, 0.2)"
    {...props}
  />
);

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
          {/* Sony Logo */}
          <img
            src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
            alt="Sony Logo"
            style={{
              width: "180px",
              marginBottom: "10px",
              filter: "brightness(1.5) invert(1)",
            }}
          />

          {/* Tagline */}
          <Text fontSize="lg" fontStyle="italic" fontWeight="light" color="gray.300">
            "Innovation That Moves the World"
          </Text>
        </Box>
      </Box>

      {/* Right Panel - Sign-Up Form */}
      <Flex width="50%" alignItems="center" justifyContent="center">
        <Paper>
          <Heading mb={4} size="lg" color="white">
            Sign Up
          </Heading>

          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color="white">Username</FormLabel>
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  bg="gray.800"
                  border="1px solid rgba(255, 255, 255, 0.3)"
                  color="white"
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  bg="gray.800"
                  border="1px solid rgba(255, 255, 255, 0.3)"
                  color="white"
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  bg="gray.800"
                  border="1px solid rgba(255, 255, 255, 0.3)"
                  color="white"
                  _placeholder={{ color: "gray.400" }}
                />
              </FormControl>

              <Button
                type="submit"
                bg="black"
                color="white"
                _hover={{ bg: "gray.800", boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.6)" }}
                width="full"
              >
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
          <Text mt={4} color="white">
            Already have an account?{" "}
            <Text as="span" color="blue.300" fontWeight="bold" cursor="pointer" onClick={() => navigate("/login")}>
              Login here
            </Text>
          </Text>
        </Paper>
      </Flex>
    </Flex>
  );
};

export default SignUp;
