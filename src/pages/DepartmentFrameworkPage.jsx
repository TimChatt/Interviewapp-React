import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  Tag,
  VStack,
  HStack,
  Collapse,
  Icon,
} from "@chakra-ui/react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const DepartmentFrameworkPage = () => {
  const { department } = useParams();
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchCompetencies = async () => {
      try {
        const response = await fetch(
          `https://interviewappbe-production.up.railway.app/api/get-department-competencies/${department}`
        );
        if (!response.ok) throw new Error("Failed to fetch competencies.");
        const data = await response.json();
        setCompetencies(data.competencies);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetencies();
  }, [department]);

  const toggleCategoryExpansion = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // Group competencies by category
  const categorizedCompetencies = competencies.reduce((acc, competency) => {
    const category = competency.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(competency);
    return acc;
  }, {});

  return (
    <Box maxW="1400px" mx="auto" py="6" px="6" bg="gray.50" borderRadius="lg">
      <Heading size="xl" textAlign="center" color="purple.600" mb="6">
        {department} - Competency Framework
      </Heading>

      {loading && <Spinner size="xl" color="purple.500" />}
      {error && (
        <Alert status="error" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Search Input */}
      <HStack justify="space-between" mb="6">
        <Input
          placeholder="🔍 Search for a competency..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          width="350px"
          bg="white"
          shadow="md"
          borderRadius="md"
        />
      </HStack>

      {/* Competency Table with Categories */}
      <Box overflowX="auto">
        {Object.entries(categorizedCompetencies).map(([category, competencies]) => (
          <Box key={category} mb={6}>
            <HStack
              onClick={() => toggleCategoryExpansion(category)}
              cursor="pointer"
              bg="purple.100"
              p={3}
              borderRadius="md"
              _hover={{ bg: "purple.200" }}
              justify="space-between"
            >
              <Heading size="md" color="purple.700">{category}</Heading>
              <Icon as={expandedCategories[category] ? FaChevronUp : FaChevronDown} />
            </HStack>
            <Collapse in={expandedCategories[category]}>
              <Table variant="striped" colorScheme="gray" size="md" shadow="md" borderRadius="lg" mt={3}>
                <Thead bg="purple.600">
                  <Tr>
                    <Th color="white" fontSize="md">Competency</Th>
                    <Th color="white" fontSize="md">Description</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {competencies.map(({ competency, description }, index) => (
                    <Tr key={index} _hover={{ bg: "gray.100" }}>
                      <Td fontWeight="bold" color="gray.700">{competency}</Td>
                      <Td>{description || "No description available"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Collapse>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DepartmentFrameworkPage;
