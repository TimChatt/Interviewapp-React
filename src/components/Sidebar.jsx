import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { 
  VStack, Box, Button, Collapse, Icon, useColorModeValue 
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
      justifyContent="space-between"
    >
      {/* Logo Section */}
      <VStack spacing="4" align="center">
        <Icon as={FaEye} boxSize="8" color="blue.500" />
        <Box fontSize="xl" fontWeight="bold" color="blue.500">
          TA Vision
        </Box>
      </VStack>

      {/* Navigation Links */}
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

      {/* Logout Button */}
      <Button 
        onClick={handleLogout} 
        colorScheme="red" 
        mt="auto"
        width="full"
      >
        Logout
      </Button>
    </Box>
  );
};

export default Sidebar;
