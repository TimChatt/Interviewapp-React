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
  const [expandedRows, setExpandedRows] = useState({});

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

  const toggleRowExpansion = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

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

      {/* Competency Table */}
      <Box overflowX="auto">
        <Table variant="striped" colorScheme="gray" size="md" shadow="md" borderRadius="lg">
          <Thead bg="purple.600">
            <Tr>
              <Th color="white" fontSize="md">Competency</Th>
              <Th color="white" fontSize="md">Details</Th>
            </Tr>
          </Thead>
          <Tbody>
            {competencies.map(({ competency, description }, index) => (
              <React.Fragment key={index}>
                <Tr _hover={{ bg: "gray.100" }}>
                  <Td fontWeight="bold" color="gray.700">{competency}</Td>
                  <Td textAlign="center">
                    <Button size="sm" onClick={() => toggleRowExpansion(index)}>
                      <Icon as={expandedRows[index] ? FaChevronUp : FaChevronDown} />
                    </Button>
                  </Td>
                </Tr>
                <Tr>
                  <Td colSpan={2}>
                    <Collapse in={expandedRows[index]}>
                      <Box p={4} bg="gray.50" borderRadius="md">
                        <strong>Description:</strong> {description || "No description available"}
                      </Box>
                    </Collapse>
                  </Td>
                </Tr>
              </React.Fragment>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DepartmentFrameworkPage;
