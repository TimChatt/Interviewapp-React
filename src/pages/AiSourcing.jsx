import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Text,
  VStack,
  HStack,
  Spinner,
  Select,
  Link,
} from "@chakra-ui/react";
import { FaSlidersH, FaSearch, FaLinkedin, FaGithub, FaGlobe, FaUserPlus } from "react-icons/fa";

const AISourcingTool = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    setSearchResults([]);

    // Add search to history (moving to top)
    setSearchHistory([searchQuery, ...searchHistory]);
    
    try {
      const response = await fetch("https://api.example.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      
      if (!response.ok) throw new Error("Failed to fetch results");
      const results = await response.json();
      
      setSearchResults(results);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidateDetails = async (candidateId) => {
    try {
      setSelectedCandidate(null);
      const response = await fetch(`https://api.example.com/candidate/${candidateId}`);
      if (!response.ok) throw new Error("Failed to fetch candidate details");
      const details = await response.json();
      setSelectedCandidate(details);
    } catch (error) {
      console.error("Error fetching candidate details:", error);
    }
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
    
    const sortedResults = [...searchResults].sort((a, b) => {
      if (a[field] < b[field]) return order === "asc" ? -1 : 1;
      if (a[field] > b[field]) return order === "asc" ? 1 : -1;
      return 0;
    });
    
    setSearchResults(sortedResults);
  };

  return (
    <Box display="flex" flexDirection="column" p={6}>
      {/* Search Input Box */}
      <HStack spacing={3} mb={4}>
        <Input
          placeholder="Describe the ideal candidate (e.g. 'Senior Frontend Engineer with React experience in London')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <IconButton icon={<FaSlidersH />} onClick={onOpen} aria-label="Edit Filters" />
        <Button colorScheme="blue" leftIcon={<FaSearch />} onClick={handleSearch}>
          Search
        </Button>
      </HStack>

      {/* Search Moves to Top */}
      {searchHistory.length > 0 && (
        <Box mb={4} p={3} bg="gray.100" borderRadius="md">
          <Text fontSize="md" fontWeight="bold">Latest Search:</Text>
          <Text fontSize="sm">{searchHistory[0]}</Text>
        </Box>
      )}

      {loading ? (
        <Spinner size="xl" color="blue.500" mt={4} alignSelf="center" />
      ) : (
        <HStack spacing={6} align="flex-start">
          <Box flex={1}>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th onClick={() => handleSort("name")}>Name</Th>
                  <Th onClick={() => handleSort("jobTitle")}>Job Title</Th>
                  <Th onClick={() => handleSort("company")}>Company</Th>
                  <Th onClick={() => handleSort("location")}>Location</Th>
                </Tr>
              </Thead>
              <Tbody>
                {searchResults.map((candidate) => (
                  <Tr key={candidate.id} onClick={() => fetchCandidateDetails(candidate.id)}>
                    <Td>{candidate.name}</Td>
                    <Td>{candidate.jobTitle}</Td>
                    <Td>{candidate.company}</Td>
                    <Td>{candidate.location}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Candidate Profile */}
          {selectedCandidate && (
            <Box flex={0.5} p={4} bg="gray.50" borderRadius="md" boxShadow="lg">
              <Text fontSize="xl" fontWeight="bold">{selectedCandidate.name}</Text>
              <Text fontSize="md" color="gray.600">{selectedCandidate.jobTitle} at {selectedCandidate.company}</Text>
              <Text fontSize="sm" color="gray.500">{selectedCandidate.location}</Text>

              <Box mt={4}>
                <Text fontWeight="bold">Work Experience:</Text>
                {selectedCandidate.experience?.map((exp, idx) => (
                  <Text key={idx} fontSize="sm">{exp.title} at {exp.company} ({exp.years})</Text>
                ))}
              </Box>

              <Box mt={4}>
                <Text fontWeight="bold">Skills:</Text>
                <Text fontSize="sm">{selectedCandidate.skills?.join(", ") || "N/A"}</Text>
              </Box>

              <Box mt={4}>
                <Text fontWeight="bold">Education:</Text>
                <Text fontSize="sm">{selectedCandidate.education?.degree} at {selectedCandidate.education?.university} ({selectedCandidate.education?.year})</Text>
              </Box>

              <Box mt={4}>
                <Text fontWeight="bold">Contact:</Text>
                {selectedCandidate.linkedin && <Link href={selectedCandidate.linkedin} isExternal><Icon as={FaLinkedin} mr={2} />LinkedIn</Link>}
                {selectedCandidate.github && <Link href={selectedCandidate.github} isExternal ml={2}><Icon as={FaGithub} mr={2} />GitHub</Link>}
                {selectedCandidate.website && <Link href={selectedCandidate.website} isExternal ml={2}><Icon as={FaGlobe} mr={2} />Portfolio</Link>}
              </Box>
              
              <Button leftIcon={<FaUserPlus />} colorScheme="blue" mt={4}>
                Save to Project
              </Button>
            </Box>
          )}
        </HStack>
      )}
    </Box>
  );
};

export default AISourcingTool;
