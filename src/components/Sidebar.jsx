import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { 
  VStack, HStack, Box, Button, Collapse, Icon, Text, useColorModeValue 
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { 
  FaEye, FaChevronDown, FaChevronUp, FaHome, FaFutbol, 
  FaBasketballBall, FaTrophy, FaUsers, FaTools, FaClipboardList 
} from "react-icons/fa";

// Keyframe animation for spinning effect
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Sidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCompetencyOpen, setIsCompetencyOpen] = useState(false); // ✅ New Section Toggle
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
        <Icon 
          as={FaEye} 
          boxSize="7" 
          color={iconColor}
          sx={{
            textShadow: glowColor,
            animation: `${spin} 4s linear infinite`, // Spinning animation
          }}
        />
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

      {/* Navigation Section */}
      <VStack align="stretch" spacing="3">
        {[
          { to: "/", label: "Home", icon: FaHome },
          { to: "/candidates", label: "Candidates", icon: FaUsers },
          { to: "/insights", label: "Insights", icon: FaBasketballBall },
          { to: "/recommendations", label: "Recommendations", icon: FaTrophy },
          { to: "/interviewer/Software Engineer", label: "Interviewers", icon: FaEye },
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
            leftIcon={<Icon as={item.icon} />}
          >
            {item.label}
          </Button>
        ))}

        {/* ✅ Competency Tools Section (Collapsible) */}
        <Button 
          variant="ghost" 
          justifyContent="space-between" 
          onClick={() => setIsCompetencyOpen(prev => !prev)}
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
          leftIcon={<Icon as={FaTools} />}
        >
          Competency Tools 
          <Icon as={isCompetencyOpen ? FaChevronUp : FaChevronDown} />
        </Button>
        <Collapse in={isCompetencyOpen}>
          <VStack align="stretch" pl="4">
            <Button 
              as={Link} 
              to="/competency-framework-generator" 
              variant="ghost" 
              justifyContent="flex-start" 
              bg={location.pathname === "/competency-framework-generator" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              transition="all 0.2s ease-in-out"
              leftIcon={<Icon as={FaClipboardList} />}
            >
              Competency Framework Generator
            </Button>

            <Button 
              as={Link} 
              to="/department-competency-view" 
              variant="ghost" 
              justifyContent="flex-start" 
              bg={location.pathname === "/department-competency-view" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              transition="all 0.2s ease-in-out"
              leftIcon={<Icon as={FaFutbol} />}
            >
              Department Competency View
            </Button>

            <Button 
              as={Link} 
              to="/competency-framework-planner" 
              variant="ghost" 
              justifyContent="flex-start" 
              bg={location.pathname === "/competency-framework-planner" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              transition="all 0.2s ease-in-out"
              leftIcon={<Icon as={FaClipboardList} />}
            >
              Competency Framework Manager
            </Button>
          </VStack>
        </Collapse>

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
