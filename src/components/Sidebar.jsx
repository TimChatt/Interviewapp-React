import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { 
  VStack, HStack, Box, Button, Collapse, Icon, Text, useColorModeValue 
} from "@chakra-ui/react";
import { FaEye, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Sidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Styling for active links
  const activeBg = useColorModeValue("gray.200", "gray.700");
  const inactiveBg = "transparent";

  return (
    <Box 
      as="nav" 
      w="250px" 
      h="100vh" 
      bg={useColorModeValue("white", "gray.800")}
      boxShadow="md"
      p="4"
      display="flex"
      flexDirection="column"
    >
      {/* Logo + TA Vision Section */}
      <HStack spacing="2" align="center" justify="center" mb="6">
        <Icon as={FaEye} boxSize="8" color="blue.500" />
        <Text
          fontSize="xl"
          fontWeight="bold"
          bgGradient="linear(to-r, cyan.400, pink.400, purple.400, blue.400)"
          bgClip="text"
          textShadow="0 0 5px cyan, 0 0 10px pink, 0 0 15px purple"
          animation="glow 1.5s infinite alternate"
          css={{
            "@keyframes glow": {
              "0%": { textShadow: "0 0 5px cyan, 0 0 10px pink" },
              "50%": { textShadow: "0 0 10px purple, 0 0 15px blue" },
              "100%": { textShadow: "0 0 15px pink, 0 0 20px cyan" }
            }
          }}
        >
          TA Vision
        </Text>
      </HStack>

      {/* Navigation & Logout Section */}
      <VStack align="stretch" spacing="3" flexGrow={1}>
        <Button 
          as={Link} 
          to="/" 
          variant="ghost" 
          justifyContent="flex-start" 
          bg={location.pathname === "/" ? activeBg : inactiveBg}
        >
          Home
        </Button>
        <Button 
          as={Link} 
          to="/candidates" 
          variant="ghost" 
          justifyContent="flex-start" 
          bg={location.pathname === "/candidates" ? activeBg : inactiveBg}
        >
          Candidates
        </Button>
        <Button 
          as={Link} 
          to="/insights" 
          variant="ghost" 
          justifyContent="flex-start" 
          bg={location.pathname === "/insights" ? activeBg : inactiveBg}
        >
          Insights
        </Button>
        <Button 
          as={Link} 
          to="/recommendations" 
          variant="ghost" 
          justifyContent="flex-start" 
          bg={location.pathname === "/recommendations" ? activeBg : inactiveBg}
        >
          Recommendations
        </Button>

        {/* Admin Section (Collapsible) */}
        <Button 
          variant="ghost" 
          justifyContent="space-between" 
          onClick={() => setIsAdminOpen(!isAdminOpen)}
        >
          Admin <Icon as={isAdminOpen ? FaChevronUp : FaChevronDown} />
        </Button>
        <Collapse in={isAdminOpen}>
          <VStack align="stretch" pl="4">
            <Button 
              as={Link} 
              to="/admin" 
              variant="ghost" 
              justifyContent="flex-start" 
              bg={location.pathname === "/admin" ? activeBg : inactiveBg}
            >
              Admin Panel
            </Button>
          </VStack>
        </Collapse>

        <Button 
          as={Link} 
          to="/competency-framework-planner" 
          variant="ghost" 
          justifyContent="flex-start" 
          bg={location.pathname === "/competency-framework-planner" ? activeBg : inactiveBg}
        >
          Competency Framework
        </Button>
      </VStack>

      {/* Logout Button (Now Below the Navigation) */}
      <Button 
        onClick={handleLogout} 
        colorScheme="red" 
        width="full"
        mt="4"
      >
        Logout
      </Button>
    </Box>
  );
};

export default Sidebar;
