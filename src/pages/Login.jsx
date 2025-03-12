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

// Custom Paper Component for Futuristic Look
const Paper = (props) => (
  <Box
    bg="rgba(255, 255, 255, 0.1)" // Glass effect
    border="2px solid rgba(255, 255, 255, 0.3)" // Subtle white border
    borderRadius="15px"
    p="30px"
    width="400px"
    textAlign="center"
    backdropFilter="blur(15px)" // Smooth glass blur
    boxShadow="0px 0px 15px rgba(255, 255, 255, 0.2)" // Glowing effect
    transition="0.3s ease-in-out"
    _hover={{ boxShadow: "0px 0px 20px rgba(255, 255, 255, 0.5)" }} // Glow on hover
    {...props}
  />
);

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
    <Flex width="100vw" minH="100vh" alignItems="center" justifyContent="center" direction="column" bg="black">
      {/* Sony Logo - More Visible */}
      <Box mb={6} textAlign="center">
        <img
          src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
          alt="Sony Logo"
          style={{
            width: "180px",
            filter: "brightness(1.8) invert(1)", // Increased brightness for better contrast
            opacity: 1,
          }}
        />
      </Box>

      {/* Futuristic Login Box */}
      <Paper>
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

            <FormControl>
              <FormLabel color="white">Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
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

            <Checkbox
              colorScheme="whiteAlpha"
              isChecked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color="white"
            >
              Remember me
            </Checkbox>

            <Button
              type="submit"
              bg="black"
              color="white"
              width="full"
              transition="0.3s ease-in-out"
              _hover={{
                bg: "white",
                color: "black",
                boxShadow: "0px 0px 15px rgba(255, 255, 255, 0.6)",
              }}
            >
              LOGIN
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" mt={4} color="white">
          Don't have an account?{" "}
          <Text as={Link} to="/signup" color="blue.300" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
            Register here
          </Text>
        </Text>
      </Paper>

      {/* Quote Below Login Box - Slight Glow Effect */}
      <Text
        fontSize="lg"
        fontStyle="italic"
        fontWeight="light"
        letterSpacing="wide"
        color="gray.400"
        mt={5} // Space between login box and quote
        textAlign="center"
        filter="brightness(1.2)" // Slight glow effect
      >
        "Shaping the Future, One Innovation at a Time"
      </Text>
    </Flex>
  );
};

export default Login;
