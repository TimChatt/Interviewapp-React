import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { 
  VStack, HStack, Box, Button, Collapse, Icon, Text, useColorModeValue 
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react"; // ✅ Corrected Import
import { FaEye, FaChevronDown, FaChevronUp } from "react-icons/fa";

// Keyframe animation for the spinning eye effect
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

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
  const glowColor = useColorModeValue(
    "0 0 10px #b19cd9, 0 0 20px #9a86fd", 
    "0 0 15px #5a4fcf, 0 0 30px #e5d9f2"
  );

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
        {/* Spinning Eye Icon with Glow Effect */}
        <Icon 
          as={FaEye} 
          boxSize="7" 
          color={iconColor}
          sx={{
            textShadow: glowColor,
            animation: `${spin} 4s linear infinite`, // Spinning animation
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
        {/* Main Navigation */}
        {[
          { to: "/", label: "Home" },
          { to: "/candidates", label: "Candidates" },
          { to: "/insights", label: "Insights" },
          { to: "/recommendations", label: "Recommendations" },
          { to: "/competency-framework-planner", label: "Competency Framework" },
        ].map((item) => (
          <Button 
            as={Link} 
            to={item.to} 
            variant="ghost" 
            justifyContent="flex-start" 
            bg={location.pathname === item.to ? activeBg : inactiveBg}
            _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }} 
            transition="all 0.2s ease-in-out"
            key={item.to}
          >
            {item.label}
          </Button>
        ))}

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

        {/* Logout Button */}
        <Button 
          onClick={handleLogout} 
          colorScheme="red" 
          width="full"
          _hover={{ bg: "red.500", transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
        >
          Logout
        </Button>
      </VStack>
    </Box>
  );
};

export default Sidebar;
