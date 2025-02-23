import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { 
  VStack, HStack, Box, Button, Collapse, Icon, Text, useColorModeValue 
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { 
  FaEye, FaChevronDown, FaChevronUp, FaHome, FaUsers, FaTrophy, FaBasketballBall,
  FaClipboardList, FaTools, FaFutbol, FaTable, FaThList 
} from "react-icons/fa";

// Keyframe animation for spinning effect
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Sidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCompetencyOpen, setIsCompetencyOpen] = useState(false); 
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
  const hoverBg = useColorModeValue("#e5d9f2", "#5a4fcf"); 
  const iconColor = useColorModeValue("#b19cd9", "#9a86fd"); 
  const glowColor = useColorModeValue(
    "0 0 10px #b19cd9, 0 0 20px #9a86fd", 
    "0 0 15px #5a4fcf, 0 0 30px #e5d9f2"
  );

  return (
    <Box 
      as="nav" 
      w="300px"  // ✅ Increased width
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
            animation: `${spin} 4s linear infinite`, 
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
              to="/competency-framework-planner" 
              variant="ghost" 
              justifyContent="flex-start" 
              bg={location.pathname === "/competency-framework-planner" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              transition="all 0.2s ease-in-out"
              leftIcon={<Icon as={FaClipboardList} />}
            >
              Competency Generator
            </Button>

            <Button 
              as={Link} 
              to="/frameworks" 
              variant="ghost" 
              justifyContent="flex-start" 
              bg={location.pathname === "/frameworks" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              transition="all 0.2s ease-in-out"
              leftIcon={<Icon as={FaFutbol} />}
            >
              Department View
            </Button>

            <Button 
              as={Link} 
              to="/competency-dashboard" 
              variant="ghost" 
              justifyContent="flex-start" 
              bg={location.pathname === "/competency-dashboard" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              transition="all 0.2s ease-in-out"
              leftIcon={<Icon as={FaTable} />}
            >
              Competency Dashboard
            </Button>

            <Button 
              as={Link} 
              to="/framework-overview/:department" 
              variant="ghost" 
              justifyContent="flex-start" 
              bg={location.pathname.startsWith("/framework-overview") ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              transition="all 0.2s ease-in-out"
              leftIcon={<Icon as={FaThList} />}
            >
              Framework Overview
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
