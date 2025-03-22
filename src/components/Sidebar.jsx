import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import {
  VStack, HStack, Box, Button, Collapse, Icon, Image, Text, useColorModeValue
} from "@chakra-ui/react";
import {
  FaChevronDown, FaChevronUp, FaHome, FaUsers, FaTrophy, FaBasketballBall,
  FaClipboardList, FaTools, FaFutbol, FaTable, FaThList, FaEye
} from "react-icons/fa";

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

  const activeBg = useColorModeValue("gray.200", "gray.700");
  const inactiveBg = "transparent";
  const hoverBg = useColorModeValue("#e5d9f2", "#5a4fcf");

  return (
    <Box
      as="nav"
      w="300px"
      h="100vh"
      bg="black"
      boxShadow="xl"
      p="4"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderRight="2px solid rgba(255, 255, 255, 0.1)"
    >
      {/* Top: Sony Logo */}
      <Box mb="6" display="flex" justifyContent="center">
        <Image
          src="https://logos-world.net/wp-content/uploads/2020/04/Sony-Logo.png"
          alt="Sony Logo"
          boxSize="140px"
          objectFit="contain"
          filter="brightness(0) invert(1)"
        />
      </Box>

      {/* Middle: Navigation */}
      <VStack align="stretch" spacing="3" flex="1">
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
            leftIcon={<Icon as={item.icon} color="white" />}
            color="white"
          >
            {item.label}
          </Button>
        ))}

        {/* Competency Tools */}
        <Button
          variant="ghost"
          justifyContent="space-between"
          onClick={() => setIsCompetencyOpen((prev) => !prev)}
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
          leftIcon={<Icon as={FaTools} color="white" />}
          color="white"
        >
          Competency Tools
          <Icon as={isCompetencyOpen ? FaChevronUp : FaChevronDown} />
        </Button>
        <Collapse in={isCompetencyOpen}>
          <VStack align="stretch" pl="4">
            <Button as={Link} to="/competency-framework-planner" variant="ghost" justifyContent="flex-start"
              bg={location.pathname === "/competency-framework-planner" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              leftIcon={<Icon as={FaClipboardList} />} color="white">
              Competency Generator
            </Button>
            <Button as={Link} to="/frameworks" variant="ghost" justifyContent="flex-start"
              bg={location.pathname === "/frameworks" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              leftIcon={<Icon as={FaFutbol} />} color="white">
              Department View
            </Button>
            <Button as={Link} to="/competency-dashboard" variant="ghost" justifyContent="flex-start"
              bg={location.pathname === "/competency-dashboard" ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              leftIcon={<Icon as={FaTable} />} color="white">
              Competency Dashboard
            </Button>
            <Button as={Link} to="/framework-overview/:department" variant="ghost" justifyContent="flex-start"
              bg={location.pathname.startsWith("/framework-overview") ? activeBg : inactiveBg}
              _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
              leftIcon={<Icon as={FaThList} />} color="white">
              Framework Overview
            </Button>
          </VStack>
        </Collapse>

        {/* Admin Section */}
        <Button
          variant="ghost"
          justifyContent="space-between"
          onClick={() => setIsAdminOpen((prev) => !prev)}
          _hover={{ bg: hoverBg, color: "white", transform: "scale(1.05)" }}
          color="white"
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
              color="white"
            >
              Admin Panel
            </Button>
          </VStack>
        </Collapse>

        {/* Logout */}
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

      {/* Bottom Black Banner with Quote */}
      <Box py="4" textAlign="center" bg="black">
        <Text fontSize="sm" color="white" opacity="0.8" fontStyle="italic">
          Make.Believe
        </Text>
      </Box>
    </Box>
  );
};

export default SonySidebar;
