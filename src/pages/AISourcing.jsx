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
  Image,
  Collapse,
} from "@chakra-ui/react";
import { FaSlidersH, FaSearch, FaLinkedin, FaGithub, FaGlobe, FaUserPlus, FaBriefcase } from "react-icons/fa";

const AISourcingTool = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [expandedJobs, setExpandedJobs] = useState({});

  const handleSearch = async () => {
    if (!searchQuery) return;
    
    setLoading(true);
    setSearchResults([]);

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

  const toggleJobDetails = (index) => {
    setExpandedJobs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <Box display="flex" flexDirection="column" p={6}>
      <HStack spacing={3} mb={4}>
        <Input
          placeholder="Describe the ideal candidate (e.g. 'Senior IOS Engineer with SwiftUI experience in Hungary')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <IconButton icon={<FaSlidersH />} onClick={onOpen} aria-label="Edit Filters" />
        <Button colorScheme="blue" leftIcon={<FaSearch />} onClick={handleSearch}>
          Search
        </Button>
      </HStack>

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
                  <Th>Name</Th>
                  <Th>Job Title</Th>
                  <Th>Company</Th>
                  <Th>Location</Th>
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

          {selectedCandidate && (
            <Box flex={0.5} p={4} bg="gray.50" borderRadius="md" boxShadow="lg">
              <Text fontSize="xl" fontWeight="bold">{selectedCandidate.name}</Text>
              <Text fontSize="md" color="gray.600">{selectedCandidate.jobTitle} at {selectedCandidate.company}</Text>
              <Text fontSize="sm" color="gray.500">{selectedCandidate.location}</Text>
              
              {selectedCandidate.companyLogo && (
                <Image src={selectedCandidate.companyLogo} alt="Company Logo" boxSize="50px" mt={2} />
              )}

              <Box mt={4}>
                <Text fontWeight="bold">Career Timeline:</Text>
                <VStack align="start" spacing={3}>
                  {selectedCandidate.experience?.map((exp, idx) => (
                    <Box key={idx} p={2} w="full" bg="gray.100" borderRadius="md" _hover={{ bg: "gray.200" }} cursor="pointer" onClick={() => toggleJobDetails(idx)}>
                      <HStack align="center">
                        <Icon as={FaBriefcase} color="blue.500" />
                        <Box>
                          <Text fontSize="sm" fontWeight="bold">{exp.title} at {exp.company}</Text>
                          <Text fontSize="xs" color="gray.600">{exp.years}</Text>
                        </Box>
                      </HStack>
                      <Collapse in={expandedJobs[idx]}>
                        <Text fontSize="xs" mt={2}>{exp.description}</Text>
                      </Collapse>
                    </Box>
                  ))}
                </VStack>
              </Box>

              <Box mt={4}><Text fontWeight="bold">Skills:</Text> <Text fontSize="sm">{selectedCandidate.skills?.join(", ") || "N/A"}</Text></Box>
              <Box mt={4}><Text fontWeight="bold">Education:</Text> <Text fontSize="sm">{selectedCandidate.education?.degree} at {selectedCandidate.education?.university} ({selectedCandidate.education?.year})</Text></Box>

              <Box mt={4}>
                <Text fontWeight="bold">Contact:</Text>
                {selectedCandidate.linkedin && <Link href={selectedCandidate.linkedin} isExternal><Icon as={FaLinkedin} mr={2} />LinkedIn</Link>}
                {selectedCandidate.github && <Link href={selectedCandidate.github} isExternal ml={2}><Icon as={FaGithub} mr={2} />GitHub</Link>}
                {selectedCandidate.website && <Link href={selectedCandidate.website} isExternal ml={2}><Icon as={FaGlobe} mr={2} />Portfolio</Link>}
              </Box>
            </Box>
          )}
        </HStack>
      )}
    </Box>
  );
};

export default AISourcingTool;
