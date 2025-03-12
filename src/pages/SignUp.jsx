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

// Exact Match to Login Box
const Paper = (props) => (
  <Box
    bg="black"
    border="2px solid rgba(255, 255, 255, 0.2)"
    borderRadius="15px"
    p="30px"
    width="400px"
    textAlign="center"
    backdropFilter="blur(10px)"
    boxShadow="0px 0px 15px rgba(255, 255, 255, 0.3)"
    transition="0.3s ease-in-out"
    _hover={{ boxShadow: "0px 0px 25px rgba(255, 255, 255, 0.5)" }}
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
    <Flex width="100vw" minH="100vh" direction="column" alignItems="center" justifyContent="center" bg="black">
      {/* Sony Logo */}
      <Box mb={6} textAlign="center">
        <img
          src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
          alt="Sony Logo"
          style={{
            width: "180px",
            filter: "brightness(1.8) invert(1)", // Make logo pop more
          }}
        />
      </Box>

      {/* Futuristic Sign-Up Box (Black Theme) */}
      <Paper>
        <Heading mb={4} size="lg" color="white" textShadow="0px 0px 8px rgba(255, 255, 255, 0.6)">
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
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.3)"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{
                  borderColor: "white",
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="white">Email</FormLabel>
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.3)"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{
                  borderColor: "white",
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="white">Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="rgba(255, 255, 255, 0.1)"
                border="1px solid rgba(255, 255, 255, 0.3)"
                color="white"
                _placeholder={{ color: "gray.400" }}
                _focus={{
                  borderColor: "white",
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.8)",
                }}
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

      {/* Quote Below Sign-Up Box */}
      <Text
        fontSize="lg"
        fontStyle="italic"
        fontWeight="light"
        letterSpacing="wide"
        color="gray.400"
        mt={5}
        textAlign="center"
        filter="brightness(1.2)"
      >
        "Shaping the Future, One Innovation at a Time"
      </Text>
    </Flex>
  );
};

export default SignUp;
