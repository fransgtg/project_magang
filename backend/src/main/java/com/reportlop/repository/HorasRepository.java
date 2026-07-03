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
       "(:search = '' OR LOWER(v.namaLop) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
       "(:regional = '' OR LOWER(v.regional) LIKE LOWER(CONCAT('%', :regional, '%'))) AND " +
       "(:branch = '' OR LOWER(v.branch) LIKE LOWER(CONCAT('%', :branch, '%'))) AND " +
       "(:status = '' OR LOWER(v.status) = LOWER(:status)) " +
       "ORDER BY v.namaLop ASC")
    Page<ViewHorasStatus> findWithFilters(@org.springframework.data.repository.query.Param("search") String search, 
                                          @org.springframework.data.repository.query.Param("regional") String regional, 
                                          @org.springframework.data.repository.query.Param("branch") String branch, 
                                          @org.springframework.data.repository.query.Param("status") String status, 
                                          Pageable pageable);
}