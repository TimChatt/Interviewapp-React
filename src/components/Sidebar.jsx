import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { 
  VStack, HStack, Box, Button, Collapse, Icon, Text, useColorModeValue 
} from "@chakra-ui/react";
import { FaEye, FaChevronDown, FaChevronUp } from "react-icons/fa"; // Standard Eye Icon

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
  const iconColor = useColorModeValue("purple.400", "purple.300"); // Light purple in both themes

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
        {/* Standard Eye Icon (Light Purple) */}
        <Icon as={FaEye} boxSize="8" color={iconColor} />

        {/* TA Vision Text with Light Purple Effect */}
        <Text
          fontSize="lg"
          fontWeight="bold"
          letterSpacing="wide"
          textTransform="uppercase"
          color={iconColor}
        >
          TA Vision
        </Text>
      </HStack>

      {/* Navigation & Logout Section */}
      <VStack align="stretch" spacing="3">
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
          onClick={() => setIsAdminOpen(prev => !prev)}
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

        {/* Logout Button (Now Right Under Competency Framework) */}
        <Button 
          onClick={handleLogout} 
          colorScheme="red" 
          width="full"
        >
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;
