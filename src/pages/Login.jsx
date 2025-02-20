import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
} from "@chakra-ui/react";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate("/"); // Redirect to Home on success
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.50"
    >
      <Box
        bg="white"
        p={8}
        boxShadow="lg"
        borderRadius="lg"
        width={{ base: "90%", md: "400px" }}
      >
        <Heading textAlign="center" mb={4} size="lg" color="blue.600">
          Login
        </Heading>

        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button type="submit" colorScheme="blue" width="full">
              Login
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" mt={4}>
          Don't have an account?{" "}
          <Text as={Link} to="/signup" color="blue.500" fontWeight="bold">
            Sign up
          </Text>
        </Text>
      </Box>
    </Box>
  );
};

export default Login;
