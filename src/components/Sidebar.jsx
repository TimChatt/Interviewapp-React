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

  // Colors for the AI futuristic theme
  const activeBg = useColorModeValue("gray.200", "gray.700");
  const inactiveBg = "transparent";
  const iconColor = useColorModeValue("#b19cd9", "#9a86fd"); // Light futuristic purple
  const hoverBg = useColorModeValue("#e5d9f2", "#5a4fcf"); // Light purple for hover
  const glowColor = useColorModeValue("0 0 10px #b19cd9, 0 0 20px #9a86fd", "0 0 15px #5a4fcf, 0 0 30px #e5d9f2");

  return (
    <Box 
      as="nav" 
      w="250px" 
      h="100vh" 
      bg={useColorModeValue("white", "gray.900")}
      boxShadow="xl"
      p="4"
      display="flex"
      flexDirection="column"
      borderRight="2px solid rgba(255, 255, 255, 0.1)"
    >
      {/* Logo + TA Vision Section */}
      <HStack spacing="2" align="center" justify="center" mb="6">
        {/* Futuristic Eye Icon with Glow */}
        <Icon 
          as={FaEye} 
          boxSize="7" 
          color={iconColor}
          sx={{
            textShadow: glowColor,
            animation: "glow 1.5s infinite alternate",
            "@keyframes glow": {
              "0%": { filter: "drop-shadow(0px 0px 5px #b19cd9)" },
              "50%": { filter: "drop-shadow(0px 0px 10px #9a86fd)" },
              "100%": { filter: "drop-shadow(0px 0px 15px #e5d9f2)" }
            }
          }}
        />
        
        {/* TA Vision Text with Glowing AI Effect */}
        <Text
          fontSize="lg"
          fontWeight="bold"
          letterSpacing="wide"
          textTransform="uppercase"
          color={iconColor}
          textShadow={glowColor}
          animation="glow 1.5s infinite alternate"
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
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }} // Light purple hover & slight scale effect
          transition="all 0.2s ease-in-out"
        >
          Home
        </Button>
        <Button 
          as={Link} 
          to="/candidates" 
          variant="ghost" 
          justifyContent="flex-start" 
          bg={location.pathname === "/candidates" ? activeBg : inactiveBg}
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
        >
          Candidates
        </Button>
        <Button 
          as={Link} 
          to="/insights" 
          variant="ghost" 
          justifyContent="flex-start" 
          bg={location.pathname === "/insights" ? activeBg : inactiveBg}
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
        >
          Insights
        </Button>
        <Button 
          as={Link} 
          to="/recommendations" 
          variant="ghost" 
          justifyContent="flex-start" 
          bg={location.pathname === "/recommendations" ? activeBg : inactiveBg}
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
        >
          Recommendations
        </Button>

        {/* Admin Section (Collapsible) */}
        <Button 
          variant="ghost" 
          justifyContent="space-between" 
          onClick={() => setIsAdminOpen(prev => !prev)}
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
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
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              transition="all 0.2s ease-in-out"
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
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
        >
          Competency Framework
        </Button>

        {/* Logout Button (Now Right Under Competency Framework) */}
        <Button 
          onClick={handleLogout} 
          colorScheme="red" 
          width="full"
          _hover={{ bg: "red.500", transform: "scale(1.05)" }} // Slightly darker red on hover with scale effect
          transition="all 0.2s ease-in-out"
        >
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;
