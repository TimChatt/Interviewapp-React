/ Full refreshed SonySidebar with consistent soft purple glow on all items and shimmer quote effect with timed animation

import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  VStack, HStack, Box, Button, Collapse, Icon, Image, Text, useColorModeValue
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import {
  FaChevronDown, FaChevronUp, FaHome, FaUsers, FaTrophy, FaBasketballBall,
  FaClipboardList, FaTools, FaFutbol, FaTable, FaThList, FaEye
} from "react-icons/fa";

const shimmer = keyframes`
  0% { background-position: -300%; }
  100% { background-position: 300%; }
`;

const SonySidebar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCompetencyOpen, setIsCompetencyOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navButtonStyles = (path) => ({
    justifyContent: "flex-start",
    bg: location.pathname === path ? "#e0d3f8" : "transparent",
    color: "white",
    _hover: {
      bg: "#e0d3f8",
      color: "white",
      transform: "scale(1.05)",
      boxShadow: "0 0 10px #c7b3f0, 0 0 15px #b69de5"
    },
    transition: "all 0.3s ease-in-out",
    border: "1px solid white",
    borderRadius: "lg",
    backdropFilter: "blur(4px)",
    boxShadow: "0 0 4px white inset"
  });

  return (
    <Box
      as="nav"
      w="300px"
      h="100vh"
      bg="black"
      boxShadow="2xl"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      borderRight="2px solid rgba(255, 255, 255, 0.1)"
      position="fixed"
      top="0"
      left="0"
      zIndex="1000"
      overflow="hidden"
      position="relative"
    >
      <Box mb="6" display="flex" justifyContent="center" pt="4">
        <Image
          src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
          alt="Sony Logo"
          boxSize="140px"
          objectFit="contain"
          filter="brightness(0) invert(1)"
        />
      </Box>

      <VStack align="stretch" spacing="3" flex="1" px="4">
        {[{ to: "/", label: "Home", icon: FaHome },
          { to: "/candidates", label: "Candidates", icon: FaUsers },
          { to: "/insights", label: "Insights", icon: FaBasketballBall },
          { to: "/recommendations", label: "Recommendations", icon: FaTrophy },
          { to: "/interviewer/Software Engineer", label: "Interviewers", icon: FaEye }].map((item) => (
          <Button
            as={Link}
            to={item.to}
            leftIcon={<Icon as={item.icon} color="white" />}
            key={item.to}
            variant="ghost"
            {...navButtonStyles(item.to)}
          >
            {item.label}
          </Button>
        ))}

        <Button
          variant="ghost"
          justifyContent="space-between"
          onClick={() => setIsCompetencyOpen((prev) => !prev)}
          leftIcon={<Icon as={FaTools} color="white" />}
          color="white"
          border="1px solid white"
          borderRadius="lg"
          _hover={{
            bg: "#e0d3f8",
            color: "white",
            transform: "scale(1.05)",
            boxShadow: "0 0 10px #c7b3f0, 0 0 15px #b69de5"
          }}
        >
          Competency Tools
          <Icon as={isCompetencyOpen ? FaChevronUp : FaChevronDown} />
        </Button>
        <Collapse in={isCompetencyOpen}>
          <VStack align="stretch" pl="4">
            <Button as={Link} to="/competency-framework-planner" {...navButtonStyles("/competency-framework-planner")} leftIcon={<Icon as={FaClipboardList} />}>Competency Generator</Button>
            <Button as={Link} to="/frameworks" {...navButtonStyles("/frameworks")} leftIcon={<Icon as={FaFutbol} />}>Department View</Button>
            <Button as={Link} to="/competency-dashboard" {...navButtonStyles("/competency-dashboard")} leftIcon={<Icon as={FaTable} />}>Competency Dashboard</Button>
            <Button as={Link} to="/framework-overview/:department" {...navButtonStyles("/framework-overview")} leftIcon={<Icon as={FaThList} />}>Framework Overview</Button>
          </VStack>
        </Collapse>

        <Button
          variant="ghost"
          justifyContent="space-between"
          onClick={() => setIsAdminOpen((prev) => !prev)}
          color="white"
          border="1px solid white"
          borderRadius="lg"
          _hover={{
            bg: "#e0d3f8",
            color: "white",
            transform: "scale(1.05)",
            boxShadow: "0 0 10px #c7b3f0, 0 0 15px #b69de5"
          }}
        >
          Admin <Icon as={isAdminOpen ? FaChevronUp : FaChevronDown} />
        </Button>
        <Collapse in={isAdminOpen}>
          <VStack align="stretch" pl="4">
            <Button
              as={Link}
              to="/admin"
              {...navButtonStyles("/admin")}
            >
              Admin Panel
            </Button>
          </VStack>
        </Collapse>

        <Button
          onClick={handleLogout}
          colorScheme="red"
          width="full"
          mt="4"
          _hover={{ bg: "red.500", transform: "scale(1.05)" }}
          transition="all 0.2s ease-in-out"
        >
          Logout
        </Button>
      </VStack>

      <Box
        position="absolute"
        bottom="0"
        width="100%"
        py="4"
        textAlign="center"
        bg="black"
        px="4"
        borderTop="1px solid white"
      >
        <Text
          fontSize="sm"
          fontWeight="medium"
          bgGradient="linear(to-r, #ffffff, #9a86fd, #ffffff)"
          bgClip="text"
          animation={`${shimmer} 15s linear infinite`}
          textShadow="0 0 6px #9a86fd, 0 0 12px #ffffff30"
        >
          &laquo; Fill the world with emotion, through the power of creativity and technology.
        </Text>
      </Box>
    </Box>
  );
};

export default SonySidebar;
