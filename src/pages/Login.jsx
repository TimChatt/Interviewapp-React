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
    <Flex minH="100vh" width="100%">
      {/* Left Side with Sony Branding */}
      <Box
        flex={1}
        bg="black"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        color="white"
        p={8}
      >
        {/* Sony Logo */}
        <img
          src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
          alt="Sony Logo"
          style={{
            width: "180px",
            marginBottom: "20px",
            filter: "brightness(0) invert(1)",
          }}
        />
      </Box>

      {/* Right Side - Login Form */}
      <Box
        flex={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="white"
        p={8}
      >
        <Box
          border="1px solid black"
          borderRadius="md"
          p={8}
          width={{ base: "90%", md: "400px" }}
          boxShadow="lg"
        >
          <Heading textAlign="center" mb={4} size="lg" color="black">
            Login
          </Heading>
          
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="text"
                  placeholder="example@email.com"
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

              <Checkbox
                colorScheme="blackAlpha"
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              >
                Remember me
              </Checkbox>

              <Button type="submit" bg="black" color="white" _hover={{ bg: "gray.800" }} width="full">
                LOGIN
              </Button>
            </VStack>
          </form>

          <Text textAlign="center" mt={4} color="black">
            Don't have an account?{" "}
            <Text as={Link} to="/signup" color="black" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
              Register here
            </Text>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

export default Login;
