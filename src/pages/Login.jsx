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
  Flex,
  Checkbox,
} from "@chakra-ui/react";

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await login(username, password);
      if (success) {
        navigate("/");
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex width="100vw" minH="100vh" alignItems="center" justifyContent="center" bg="black">
      {/* Sony Logo Above */}
      <Box position="absolute" top="5%" textAlign="center">
        <img
          src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
          alt="Sony Logo"
          style={{
            width: "180px",
            filter: "brightness(0) invert(1)",
          }}
        />
      </Box>

      {/* Login Form with Futuristic Outline */}
      <Box
        border="2px solid"
        borderColor="blackAlpha.800"
        borderRadius="lg"
        p={8}
        width={{ base: "90%", md: "400px" }}
        boxShadow="0 0 10px rgba(255, 255, 255, 0.2)"
        _hover={{
          borderColor: "white",
          boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)",
        }}
        transition="0.3s ease-in-out"
        display="flex"
        flexDirection="column"
        alignItems="center"
        textAlign="center"
        bg="gray.900"
      >
        <Heading mb={4} size="lg" color="white">
          Login
        </Heading>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="white">Email Address</FormLabel>
              <Input
                type="text"
                placeholder="example@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="gray.800"
                color="white"
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="white">Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="gray.800"
                color="white"
                _placeholder={{ color: "gray.400" }}
              />
            </FormControl>

            <Checkbox colorScheme="whiteAlpha" isChecked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} color="white">
              Remember me
            </Checkbox>

            <Button
              type="submit"
              bg="black"
              color="white"
              _hover={{ bg: "gray.800" }}
              width="full"
            >
              LOGIN
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" mt={4} color="white">
          Don't have an account?{" "}
          <Text as={Link} to="/signup" color="blue.400" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
            Register here
          </Text>
        </Text>
      </Box>
    </Flex>
  );
};

export default Login;
