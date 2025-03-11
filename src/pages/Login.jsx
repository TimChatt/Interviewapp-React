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

// Custom Paper Component (Matching Sign-Up Page)
const Paper = (props) => (
  <Box
    bg="rgba(255, 255, 255, 0.7)" // Semi-transparent background
    border="2px solid black"
    borderRadius="15px"
    p="30px"
    width="400px"
    textAlign="center"
    backdropFilter="blur(15px)"
    boxShadow="0px 0px 15px rgba(0, 0, 0, 0.3)"
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
    <Flex width="100vw" minH="100vh" alignItems="center" justifyContent="center" direction="column">
      {/* Sony Logo Above the Login Box */}
      <Box mb={4} textAlign="center">
        <img
          src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
          alt="Sony Logo"
          style={{
            width: "180px",
            filter: "brightness(0) invert(1)",
          }}
        />
      </Box>

      {/* Login Box Centered */}
      <Paper>
        <Heading mb={4} size="lg" color="black">
          Login
        </Heading>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="black">Email Address</FormLabel>
              <Input
                type="text"
                placeholder="example@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                bg="white"
                border="1px solid black"
                color="black"
                _placeholder={{ color: "gray.600" }}
                _focus={{
                  borderColor: "black",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="black">Password</FormLabel>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                bg="white"
                border="1px solid black"
                color="black"
                _placeholder={{ color: "gray.600" }}
                _focus={{
                  borderColor: "black",
                  boxShadow: "0 0 10px rgba(0, 0, 0, 0.8)",
                }}
              />
            </FormControl>

            <Checkbox
              colorScheme="blackAlpha"
              isChecked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              color="black"
            >
              Remember me
            </Checkbox>

            <Button
              type="submit"
              bg="black"
              color="white"
              _hover={{
                bg: "gray.800",
                boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.6)",
              }}
              width="full"
            >
              LOGIN
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" mt={4} color="black">
          Don't have an account?{" "}
          <Text as={Link} to="/signup" color="blue.500" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
            Register here
          </Text>
        </Text>
      </Paper>

      {/* Quote Below the Login Box */}
      <Text
        fontSize="lg"
        fontStyle="italic"
        fontWeight="light"
        letterSpacing="wide"
        color="gray.600"
        mt={6} // Adds space between login box and quote
        textAlign="center"
      >
        "Pushing Boundaries, Creating Possibilities"
      </Text>
    </Flex>
  );
};

export default Login;
