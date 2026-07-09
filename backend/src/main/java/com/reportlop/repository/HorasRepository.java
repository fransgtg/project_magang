package com.reportlop.repository;

import com.reportlop.model.ViewHorasStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HorasRepository extends JpaRepository<ViewHorasStatus, String> {
    // Fungsi khusus untuk fitur search dan filter
    @org.springframework.data.jpa.repository.Query("SELECT v FROM ViewHorasStatus v WHERE " +
       "LOWER(COALESCE(v.namaLop, '')) LIKE LOWER(CONCAT('%', :search, '%')) AND " +
       "LOWER(COALESCE(v.regional, '')) LIKE LOWER(CONCAT('%', :regional, '%')) AND " +
       "LOWER(COALESCE(v.branch, '')) LIKE LOWER(CONCAT('%', :branch, '%')) AND " +
       "LOWER(COALESCE(v.status, '')) = COALESCE(NULLIF(LOWER(:status), ''), LOWER(COALESCE(v.status, ''))) " +
       "ORDER BY v.namaLop ASC")
    Page<ViewHorasStatus> findWithFilters(@org.springframework.data.repository.query.Param("search") String search, 
                                          @org.springframework.data.repository.query.Param("regional") String regional, 
                                          @org.springframework.data.repository.query.Param("branch") String branch, 
                                          @org.springframework.data.repository.query.Param("status") String status, 
                                          Pageable pageable);
}