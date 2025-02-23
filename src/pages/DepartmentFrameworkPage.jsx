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
  Tooltip,
} from "@chakra-ui/react";

const DepartmentFrameworkPage = () => {
  const { department } = useParams();
  const [competencies, setCompetencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  // Extract unique job titles
  const jobTitles = [...new Set(competencies.flatMap(c => c.job_titles))];

  // Filter competencies based on search input
  const filteredCompetencies = competencies.filter(c =>
    c.competency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to export data as CSV
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Competency," + jobTitles.join(",") + "\n";

    filteredCompetencies.forEach(({ competency, job_titles }) => {
      const row = [competency, ...jobTitles.map(title => (job_titles.includes(title) ? "✓" : ""))];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${department}-competencies.csv`);
    document.body.appendChild(link);
    link.click();
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

      {/* Search & Export Buttons */}
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
        <Button colorScheme="blue" onClick={handleExportCSV}>
          Export CSV 📥
        </Button>
      </HStack>

      {/* Competency Table - Modern UI */}
      <Box overflowX="auto">
        <Table variant="striped" colorScheme="gray" size="md" shadow="md" borderRadius="lg">
          <Thead bg="purple.600">
            <Tr>
              <Th color="white" fontSize="md">Competency</Th>
              {jobTitles.map((title, idx) => (
                <Th key={idx} color="white" fontSize="md">{title}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {filteredCompetencies.map(({ competency, job_titles }, index) => (
              <Tr key={index} _hover={{ bg: "gray.100" }}>
                <Td fontWeight="bold" color="gray.700">
                  <Tooltip label="Click for details" aria-label="A tooltip">
                    {competency}
                  </Tooltip>
                </Td>
                {jobTitles.map((title, idx) => (
                  <Td key={idx} textAlign="center">
                    {job_titles.includes(title) ? (
                      <Tag colorScheme="green" size="lg">✓</Tag>
                    ) : (
                      <Tag colorScheme="gray" size="lg">—</Tag>
                    )}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DepartmentFrameworkPage;
